from config import load_config
load_config()  # .env laden oder Setup-Routine starten – muss als erstes passieren

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sites.kleinanzeigen import KleinanzeigenScraper
from sites.ebay import EbayScraper

PROVIDERS = {
    "kleinanzeigen": KleinanzeigenScraper(),
    "ebay": EbayScraper(),
}
import threading
import time
import os

STATIC_FOLDER = os.path.join(os.path.dirname(__file__), 'frontend-react', 'dist')
app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path='')
CORS(app)

# Einfacher In-Memory-Cache (Python-Dict)
_cache = {}
CACHE_TTL = 300  # 5 Minuten

def _cache_get(key):
    if key in _cache:
        data, ts = _cache[key]
        if time.time() - ts < CACHE_TTL:
            return data
        del _cache[key]
    return None

def _cache_set(key, data):
    _cache[key] = (data, time.time())

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

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    """React-Frontend ausliefern (nur für nicht-API-Routen)"""
    if path and os.path.exists(os.path.join(STATIC_FOLDER, path)):
        return send_from_directory(STATIC_FOLDER, path)
    return send_from_directory(STATIC_FOLDER, 'index.html')

@app.route("/search", methods=["POST"])
def search():
    data = request.json
    query = data.get("query", "")
    location = data.get("location", "")
    radius = data.get("radius", 50)
    category = data.get("category", None)
    category_id = data.get("category_id", None)
    start_page = data.get("start_page", 1)
    batch_size = data.get("batch_size", 3)

    if not query and not category_id:
        return jsonify({"results": [], "has_more": False})

    sources = data.get("sources", ["kleinanzeigen"])

    cache_key = f"{query}|{location}|{radius}|{category}|{category_id}|{start_page}|{batch_size}|{'_'.join(sorted(sources))}"
    cached = _cache_get(cache_key)
    if cached:
        print(f"[cache] HIT: {cache_key}")
        return jsonify(cached)

    print(f"[cache] MISS: {cache_key}")
    all_results = []
    has_more = False

    for source in sources:
        if source not in PROVIDERS:
            continue
        results, more = PROVIDERS[source].search(
            query, location=location, radius=radius,
            start_page=start_page, batch_size=batch_size,
            category=category, category_id=category_id
        )
        all_results.extend(results)
        has_more = has_more or more

    sorted_results = sorted(all_results, key=lambda x: x["price"])
    response_data = {"results": sorted_results, "has_more": has_more}
    _cache_set(cache_key, response_data)

    return jsonify(response_data)

@app.route("/alerts", methods=["GET"])
def get_alerts():
    """Get all price alerts"""
    if not MONITOR_AVAILABLE:
        return jsonify({"alerts": [], "error": "Price monitor not available"}), 503
    return jsonify({"alerts": monitor.alerts})

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
        return jsonify({"success": True, "checked": len(monitor.alerts)})
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
        send_telegram(chat_id, "✅ BargainBot Test\n\nDeine Telegram-Benachrichtigungen funktionieren!")
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/search-alerts", methods=["GET"])
def get_search_alerts():
    if not MONITOR_AVAILABLE:
        return jsonify({"alerts": [], "error": "Monitor not available"}), 503
    return jsonify({"alerts": search_monitor.alerts})

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
