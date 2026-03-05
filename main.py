from config import load_config
load_config()  # .env laden oder Setup-Routine starten – muss als erstes passieren

import re as _re
try:
    from groq import Groq as _Groq
    _GROQ_AVAILABLE = True
except ImportError:
    _GROQ_AVAILABLE = False

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_compress import Compress
from sites.kleinanzeigen import KleinanzeigenScraper
from sites.ebay import EbayScraper
from sites.price_history import PriceHistory
from database import init_db, SessionLocal, PushSubscription

# DB Initialisieren
init_db()

PROVIDERS = {
    "kleinanzeigen": KleinanzeigenScraper(),
    "ebay": EbayScraper(),
}
price_history = PriceHistory()
import threading
import time
import os
import json
from collections import deque

def analyze_with_ai(listings):
    """Analysiert die Top-Listings mit Groq und gibt ein strukturiertes Insight zurück."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key or not _GROQ_AVAILABLE or not listings:
        return None
    try:
        client = _Groq(api_key=api_key)
        compact = [
            {"title": l.get("title", ""), "price": l.get("price", 0), "original": l.get("original", ""), "url": l.get("url", "")}
            for l in listings[:10]
        ]
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Du bist ein Preisanalyse-Experte für Gebrauchtwaren auf deutschen Plattformen. "
                        "Analysiere die Listings und antworte NUR mit einem JSON-Objekt (kein Markdown, keine Erklärungen). "
                        "Das JSON muss folgende Felder haben: "
                        "\"ai_summary\" (string, 1-2 Sätze: welcher Deal am besten ist und warum), "
                        "\"best_deal_url\" (string, URL des besten Deals oder null), "
                        "\"scam_warnings\" (array of strings, Warnungen zu verdächtig günstigen oder teuren Angeboten, leer wenn keine). "
                        "Bei VB-Preisen: rechne 10-15% Rabatt ein. "
                        "Antworte auf Deutsch."
                    )
                },
                {
                    "role": "user",
                    "content": f"Analysiere diese Kleinanzeigen-Listings und finde den besten Deal:\n{json.dumps(compact, ensure_ascii=False)}"
                }
            ],
            temperature=0.3,
            max_tokens=500,
        )
        text = response.choices[0].message.content.strip()
        match = _re.search(r'\{[\s\S]*\}', text)
        if match:
            return json.loads(match.group(0))
    except Exception as e:
        print(f"[ai] Analyse fehlgeschlagen: {e}")
    return None


def parse_natural_query(raw_query):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key or not _GROQ_AVAILABLE or not raw_query.strip():
        return None
    try:
        client = _Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Du bist ein Suchbegriff-Parser für eine deutsche Kleinanzeigen-Plattform. "
                        "Analysiere den Suchbegriff des Nutzers und antworte NUR mit einem JSON-Objekt. "
                        "Felder: "
                        "\"optimized_query\" (string, bereinigter Suchbegriff ohne Filter-Attribute und ohne Ortsangaben), "
                        "\"condition\" (string, \"gebraucht\" | \"neu\" | \"\"), "
                        "\"min_price\" (number oder null), "
                        "\"max_price\" (number oder null), "
                        "\"location\" (string, erkannter Ort/Stadt/PLZ oder \"\"), "
                        "\"radius\" (number oder null, Umkreis in km wenn explizit genannt z.B. '100km' oder 'umkreis 50', sonst null), "
                        "\"detected\" (array of strings, kurze Stichworte der erkannten Attribute auf Deutsch, leer wenn nichts erkannt). "
                        "Beispiel Input: \"mercedes c180 in nürnberg\" "
                        "Beispiel Output: {\"optimized_query\": \"Mercedes C180\", \"condition\": \"\", \"min_price\": null, \"max_price\": null, \"location\": \"nürnberg\", \"radius\": null, \"detected\": [\"Nürnberg\"]}. "
                        "Beispiel Input: \"mercedes c180 in nürnberg umkreis 100km\" "
                        "Beispiel Output: {\"optimized_query\": \"Mercedes C180\", \"condition\": \"\", \"min_price\": null, \"max_price\": null, \"location\": \"nürnberg\", \"radius\": 100, \"detected\": [\"Nürnberg\", \"100 km Umkreis\"]}. "
                        "Beispiel Input: \"Fiat Punto 2009 benziner 4 türen\" "
                        "Beispiel Output: {\"optimized_query\": \"Fiat Punto 2009\", \"condition\": \"gebraucht\", \"min_price\": null, \"max_price\": null, \"location\": \"\", \"radius\": null, \"detected\": [\"Benziner\", \"4-Türer\"]}. "
                        "Beispiel Input: \"RTX 3080 unter 400 Euro\" "
                        "Beispiel Output: {\"optimized_query\": \"RTX 3080\", \"condition\": \"\", \"min_price\": null, \"max_price\": 400, \"location\": \"\", \"radius\": null, \"detected\": [\"max. 400€\"]}. "
                        "Nur antworten wenn wirklich etwas extrahierbar ist — bei einfachen Queries wie \"iPhone\" alles null/leer lassen."
                    )
                },
                {"role": "user", "content": raw_query}
            ],
            temperature=0.1,
            max_tokens=200,
        )
        text = response.choices[0].message.content.strip()
        match = _re.search(r'\{[\s\S]*\}', text)
        if match:
            return json.loads(match.group(0))
    except Exception as e:
        print(f"[ai] Query-Parsing fehlgeschlagen: {e}")
    return None


# In-memory ring buffer for recently seen items (max 60)
_recent_items = deque(maxlen=60)
_recent_items_lock = threading.Lock()

STATIC_FOLDER = os.path.join(os.path.dirname(__file__), 'frontend-react', 'dist')
app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path='')
CORS(app)
Compress(app)

# ── Cache (Redis with in-memory fallback) ──────────
from cache import cache

# Keep backward compatibility with old function names
_cache_get = cache.get
_cache_set = cache.set

# Try to import price monitor, but don't fail if it's not available
try:
    from price_monitor import PriceMonitor, SearchAlertMonitor
    monitor = PriceMonitor()
    search_monitor = SearchAlertMonitor()
    MONITOR_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Price monitor not available: {e}")
    monitor = None
    search_monitor = None
    MONITOR_AVAILABLE = False
except Exception as e:
    print(f"Warning: Error initializing price monitor: {e}")
    monitor = None
    search_monitor = None
    MONITOR_AVAILABLE = False

@app.route("/push-subscribe", methods=["POST"])
def push_subscribe():
    subscription = request.json
    if not subscription:
        return jsonify({"success": False, "error": "No subscription data"}), 400
    
    # Extract endpoint for comparison (unique identifier for push subscriptions)
    endpoint = subscription.get("endpoint")
    if not endpoint:
        return jsonify({"success": False, "error": "No endpoint in subscription"}), 400
    
    db = SessionLocal()
    try:
        # Check if subscription with this endpoint already exists
        existing = db.query(PushSubscription).filter(
            PushSubscription.subscription_data["endpoint"].astext == endpoint
        ).first()
        
        if not existing:
            new_sub = PushSubscription(subscription_data=subscription)
            db.add(new_sub)
            db.commit()
        
        return jsonify({"success": True}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    """React-Frontend ausliefern (nur für nicht-API-Routen)"""
    if path and os.path.exists(os.path.join(STATIC_FOLDER, path)):
        response = send_from_directory(STATIC_FOLDER, path)
        # Cache static assets for 1 year (Vite builds have content hashes)
        if '.' in path and not path.startswith('index'):
            response.headers['Cache-Control'] = 'public, max-age=31536000, immutable'
        return response
    return send_from_directory(STATIC_FOLDER, 'index.html')

@app.route("/search", methods=["POST"])
def search():
  try:
    data = request.json or {}
    query = data.get("query", "")
    location = data.get("location", "")
    radius = data.get("radius", 50)
    category = data.get("category", None)
    category_id = data.get("category_id", None)
    start_page = data.get("start_page", 1)
    batch_size = data.get("batch_size", 3)
    min_price = data.get("min_price", None)
    max_price = data.get("max_price", None)
    category_filters = data.get("category_filters", None)
    condition = data.get("condition", "")

    if not query and not category_id:
        return jsonify({"results": [], "has_more": False})

    sources = data.get("sources", ["kleinanzeigen"])
    sort_by = data.get("sort_by", None)

    cf_key = ""
    if category_filters:
        cf_key = "|" + "&".join(f"{k}={v}" for k, v in sorted(category_filters.items()) if v)
    cache_key = f"{query}|{location}|{radius}|{category}|{category_id}|{start_page}|{batch_size}|{min_price}|{max_price}|{'_'.join(sorted(sources))}{cf_key}|{condition}|{sort_by or ''}"
    cached = _cache_get(cache_key)
    if cached:
        print(f"[cache] HIT: {cache_key}")
        return jsonify(cached)

    print(f"[cache] MISS: {cache_key}")
    all_results = []
    has_more = False

    # Quellen parallel abfragen für maximale Geschwindigkeit
    from concurrent.futures import ThreadPoolExecutor, as_completed

    def _fetch_source(source):
        return source, PROVIDERS[source].search(
            query, location=location, radius=radius,
            start_page=start_page, batch_size=batch_size,
            category=category, category_id=category_id,
            min_price=min_price, max_price=max_price,
            category_filters=category_filters,
            condition=condition
        )

    valid_sources = [s for s in sources if s in PROVIDERS]
    with ThreadPoolExecutor(max_workers=len(valid_sources)) as executor:
        futures = {executor.submit(_fetch_source, s): s for s in valid_sources}
        for future in as_completed(futures):
            source_name = futures[future]
            try:
                _, (results, more) = future.result()
                all_results.extend(results)
                has_more = has_more or more
            except Exception as e:
                print(f"[{source_name}] Fehler beim Scraping: {e}")
                continue

    # Preisfilter serverseitig anwenden
    if min_price is not None:
        all_results = [r for r in all_results if r.get("price", 0) >= min_price]
    if max_price is not None:
        all_results = [r for r in all_results if r.get("price", 0) <= max_price]

    # Record price history for results in background - with proper error handling
    def _record_async(items):
        try:
            for r in items:
                if r.get("url") and r.get("price"):
                    price_history.record_price(r["url"], r["price"])
        except Exception as e:
            print(f"[price_history] Error recording prices: {e}")
    
    # Feed recent items buffer (for /api/trending)
    with _recent_items_lock:
        for r in all_results[:10]:
            if r.get("title") and r.get("price"):
                _recent_items.append({
                    "title": r["title"],
                    "price": f'{r["price"]:.0f}€',
                    "tag": r.get("source", "kleinanzeigen").capitalize(),
                    "url": r.get("url", ""),
                })

    # Use existing thread to avoid spawning new threads for every request
    threading.Thread(target=_record_async, args=(all_results,), daemon=True, name="price-recorder").start()

    # Optionale serverseitige Sortierung (ergänzt Frontend-Sortierung)
    if sort_by == "price_asc":
        all_results.sort(key=lambda r: r.get("price", 0))
    elif sort_by == "price_desc":
        all_results.sort(key=lambda r: r.get("price", 0), reverse=True)
    sorted_results = all_results

    ai_insight = analyze_with_ai(sorted_results[:10])
    response_data = {"results": sorted_results, "has_more": has_more, "ai_insight": ai_insight}
    _cache_set(cache_key, response_data)

    return jsonify(response_data)

  except Exception as e:
    print(f"[search] Unerwarteter Fehler: {e}")
    return jsonify({"error": str(e), "results": [], "has_more": False}), 500

@app.route("/price-history", methods=["GET"])
def get_price_history():
    url = request.args.get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400
    
    history = price_history.get_history(url)
    stats = price_history.get_stats(url)
    return jsonify({
        "url": url,
        "history": history,
        "stats": stats
    })

@app.route("/alerts", methods=["GET"])
def get_alerts():
    """Get all price alerts"""
    if not MONITOR_AVAILABLE:
        return jsonify({"alerts": [], "error": "Price monitor not available"}), 503
    return jsonify({"alerts": monitor.get_all_alerts()})

@app.route("/alerts", methods=["POST"])
def create_alert():
    """Create a new price alert"""
    if not MONITOR_AVAILABLE:
        return jsonify({"success": False, "error": "Price monitor not available"}), 503
    data = request.json
    try:
        alert_id = monitor.add_alert({
            'url': data.get('url'),
            'title': data.get('title'),
            'current_price': data.get('current_price'),
            'alert_price': data.get('alert_price'),
            'notification_method': data.get('notification_method'),
            'contact_info': data.get('contact_info')
        })
        return jsonify({"success": True, "alert_id": alert_id}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route("/alerts/<path:alert_id>", methods=["DELETE"])
def delete_alert(alert_id):
    """Delete a price alert"""
    if not MONITOR_AVAILABLE:
        return jsonify({"success": False, "error": "Price monitor not available"}), 503
    try:
        monitor.remove_alert(alert_id)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route("/alerts/check", methods=["POST"])
def check_alerts():
    """Manually trigger alert check"""
    if not MONITOR_AVAILABLE:
        return jsonify({"success": False, "error": "Price monitor not available"}), 503
    try:
        monitor.check_all_alerts()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/test-telegram", methods=["POST"])
def test_telegram():
    """Sendet eine Test-Nachricht an die angegebene Telegram Chat ID"""
    from notifications import send_telegram
    data = request.json
    chat_id = data.get('chat_id', '').strip()
    if not chat_id:
        return jsonify({"success": False, "error": "Keine Chat ID angegeben"}), 400
    try:
        send_telegram(chat_id, "✅ Emirates of Deals Test\n\nDeine Telegram-Benachrichtigungen funktionieren!")
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/search-alerts", methods=["GET"])
def get_search_alerts():
    if not MONITOR_AVAILABLE:
        return jsonify({"alerts": [], "error": "Monitor not available"}), 503
    return jsonify({"alerts": search_monitor.get_all_alerts()})

@app.route("/search-alerts", methods=["POST"])
def create_search_alert():
    if not MONITOR_AVAILABLE:
        return jsonify({"success": False, "error": "Monitor not available"}), 503
    data = request.json
    try:
        alert_id = search_monitor.add_alert({
            'query': data.get('query'),
            'max_price': data.get('max_price'),
            'contact_info': data.get('contact_info'),
        })
        return jsonify({"success": True, "alert_id": alert_id}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route("/search-alerts/<alert_id>", methods=["DELETE"])
def delete_search_alert(alert_id):
    if not MONITOR_AVAILABLE:
        return jsonify({"success": False, "error": "Monitor not available"}), 503
    try:
        search_monitor.remove_alert(alert_id)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route("/search-alerts/check", methods=["POST"])
def check_search_alerts():
    if not MONITOR_AVAILABLE:
        return jsonify({"success": False, "error": "Monitor not available"}), 503
    try:
        search_monitor.check_all_alerts()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/trending", methods=["GET"])
def get_trending():
    """Returns recently seen items from the in-memory buffer."""
    with _recent_items_lock:
        items = list(_recent_items)
    # Deduplicate by title (keep latest)
    seen_titles = set()
    unique = []
    for item in reversed(items):
        if item["title"] not in seen_titles:
            seen_titles.add(item["title"])
            unique.append(item)
        if len(unique) >= 20:
            break
    return jsonify({"items": unique})


@app.route("/api/config", methods=["GET"])
def get_config():
    """Returns public runtime config flags."""
    return jsonify({
        "ebay_available": bool(os.environ.get("EBAY_APP_ID"))
    })


@app.route("/api/parse-query", methods=["POST"])
def api_parse_query():
    data = request.json or {}
    raw_query = data.get("query", "").strip()
    if not raw_query:
        return jsonify(None)
    result = parse_natural_query(raw_query)
    return jsonify(result)


@app.route("/api/health", methods=["GET"])
def get_health():
    """Returns the health status of all scrapers based on logs from the last 24 hours."""
    from database import SessionLocal, ScraperLog
    from sqlalchemy import func, case
    from datetime import datetime, timedelta
    
    db = SessionLocal()
    try:
        one_day_ago = datetime.utcnow() - timedelta(days=1)
        
        # Summary for each source
        stats = db.query(
            ScraperLog.source,
            func.count(ScraperLog.id).label('total'),
            func.sum(case((ScraperLog.status == 'success', 1), else_=0)).label('successes'),
            func.max(ScraperLog.timestamp).label('last_seen')
        ).filter(ScraperLog.timestamp >= one_day_ago).group_by(ScraperLog.source).all()
        
        results = {}
        # Default providers if no logs yet
        for provider in ["kleinanzeigen", "ebay"]:
            results[provider] = {
                "status": "unknown",
                "success_rate": 0,
                "last_seen": None,
                "total_attempts": 0
            }

        for s in stats:
            success_rate = (s.successes / s.total) * 100 if s.total > 0 else 0
            status = "healthy" if success_rate > 80 else "warning" if success_rate > 50 else "down"
            results[s.source] = {
                "status": status,
                "success_rate": round(success_rate, 1),
                "last_seen": s.last_seen.isoformat() if s.last_seen else None,
                "total_attempts": s.total
            }
            
        return jsonify({
            "success": True, 
            "health": results,
            "server_time": datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        db.close()


def start_monitor():
    """Start price monitoring in background thread"""
    if MONITOR_AVAILABLE and monitor:
        try:
            monitor_thread = threading.Thread(target=monitor.run_monitor, args=(30,), daemon=True)
            monitor_thread.start()
            search_thread = threading.Thread(target=_search_monitor_loop, daemon=True)
            search_thread.start()
            print("Price monitor started in background")
        except Exception as e:
            print(f"Warning: Could not start price monitor: {e}")
    else:
        print("Price monitor not available - alerts will be saved but not monitored")

def _search_monitor_loop():
    while True:
        try:
            search_monitor.check_all_alerts()
            time.sleep(30 * 60)
        except Exception as e:
            print(f"Error in search monitor loop: {e}")
            time.sleep(60)

if __name__ == "__main__":
    # Start monitoring service
    start_monitor()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)
