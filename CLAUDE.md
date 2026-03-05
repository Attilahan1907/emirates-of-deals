# Emirates of Deals - Projektdokumentation für Claude

## Projektstatus: Stand 05.03.2026

---

## Was ist Emirates of Deals?

Ein Preisvergleichs- und Preisalarm-Tool für Kleinanzeigen.de (deutsche Gebrauchtmarkt-Plattform).
- Scrapt Produkte von Kleinanzeigen.de (3 Seiten parallel → ~1-1.5s Ladezeit)
- Bewertet Deals mit einem Score (Benchmark-basiert: GPU/CPU/RAM/Smartphone)
- Erlaubt Favoriten und Preisalarme via Telegram
- Suchalarm: Benachrichtigung bei neuen Angeboten unter Preisschwelle
- React-Frontend + Flask-Backend, deployed auf fly.io

---

## Tech Stack

| Schicht | Technologie |
|---------|------------|
| Backend | Python, Flask 3.0, Flask-Compress, BeautifulSoup4, concurrent.futures |
| Cache | Redis (Upstash) mit in-memory Fallback |
| Frontend | React 19, Vite (terser, code splitting), Tailwind CSS v4, Lucide Icons |
| Notifications | Telegram Bot API, Web-Push |
| Storage | SQLite/PostgreSQL, localStorage (frontend favorites) |
| Deployment | fly.io (24/7, persistent Volume) |

**Starten lokal:** `start-all.bat` → Backend auf http://localhost:5000, Frontend auf http://localhost:5173

---

## Wichtige Dateipfade

```
main.py                          # Flask API (alle Endpunkte)
database.py                      # SQLAlchemy-Modelle (PriceAlert, SearchAlert, PriceHistoryItem, PushSubscription, ScraperLog)
cache.py                         # Redis mit in-memory Fallback
price_monitor.py                 # Hintergrund-Monitoring (alle 30 Min.)
notifications.py                 # Telegram + Web-Push Versand
config.py                        # .env laden + Setup-Routine
requirements.txt                 # Python-Abhängigkeiten
start-all.bat                    # Windows-Startskript für beide Server
fly.toml                         # fly.io Deployment-Konfiguration
Dockerfile                       # Multi-stage Build (Node → Python)

sites/
  base_scraper.py                # Abstrakte Basisklasse (Header-Rotation, Delays, Proxy-Support)
  kleinanzeigen.py               # Aktiver Scraper (KleinanzeigenScraper, 3 Seiten parallel)
  ebay.py                        # eBay Scraper (EbayScraper, API-First + Scraping-Fallback)
  price_history.py               # Preishistorie-Klasse (SQLite-Backend)
  utils.py                       # PriceParser, ScraperLogger, is_relevant()

frontend-react/src/
  App.jsx                        # Haupt-App (3-Modi: Landing / Ergebnisse / Watchlist)
  api/
    search.js                    # Suche API-Client (sources-Parameter)
    alerts.js                    # Preisalarme API-Client
    searchAlerts.js              # Suchalarme API-Client
  components/
    Header.jsx                   # Pill-Nav, Glassmorphism, fixed top
    SearchBar.jsx                # Hero-Modus + Compact-Modus, Popular Searches
    FilterPanel.jsx              # Preis-Filter + Fotos-Toggle + eBay-Checkbox
    ProductCard.jsx              # Produktkarte (Favorit-Herz, Alarm-Glocke, DealScore, eBay-Badge)
    ResultsGrid.jsx              # Ergebnisgrid (alle Ergebnisse auf einmal)
    DealScore.jsx                # Quadratisches Score-Badge (grün/orange/rot)
    ProductDetailModal.jsx       # Detail-Modal (2-Spalten Desktop, Slide-in Mobile, ESC-Support)
    PriceHistoryChart.jsx        # Preisverlauf-Chart (SVG-basiert, Sparkline)
    Sparkline.jsx                # Mini-Sparkline-Komponente
    SortBar.jsx                  # Sortierung (Preis ↑↓, Deal-Score, Relevanz)
    PriceTicker.jsx              # Laufband mit echten Preisen auf Landing-Page
    DealCounter.jsx              # Animierter Deal-Zähler auf Landing-Page
    IOSInstallPrompt.jsx         # PWA-Install-Prompt für iOS
    Watchlist.jsx                # Merkliste-Ansicht
    AlertDialog.jsx              # Preisalarm-Dialog (Telegram, auto Chat-ID)
    AlertsListDialog.jsx         # Alle Alarme anzeigen/löschen (2 Tabs)
    SearchAlertDialog.jsx        # Suchalarm erstellen
    SettingsDialog.jsx           # Telegram Chat-ID + Test-Button + Scraper-Health-Dashboard
    EmptyState.jsx, LoadingState.jsx, CategoryGrid.jsx, BestDealBadge.jsx
  hooks/
    useSearch.js                 # Such-State-Management (sources, loadMore, hasMore)
    useFavorites.js              # Favoriten (localStorage + Backend-Sync)
    useNotificationSettings.jsx  # Telegram Chat-ID (React Context + localStorage)
  utils/
    computeDealScore.js          # Deal-Score-Algorithmus (Benchmark + relativer Score)
    formatPrice.js, extractModel.js
  data/
    gpuBenchmarks.js, cpuBenchmarks.js, smartphoneBenchmarks.js, ramBenchmarks.js
    categoryFilters.js           # Kategorie-spezifische Filter-Dropdowns
```

---

## Implementierte Features (vollständig)

1. ✅ **Suche** — Kleinanzeigen.de + eBay scrapen, 3 Seiten parallel, alle Ergebnisse auf einmal
2. ✅ **Filter** — Preis (Min/Max), Umkreis (nur aktiv wenn PLZ eingegeben), Fotos ein/aus
3. ✅ **Standardeinstellung** — "Deutschlandweit" beim Laden (kein PLZ nötig)
4. ✅ **Kategorien** — GPU/CPU/RAM/Smartphone mit Benchmark-Score + Sub-Filter
5. ✅ **Deal-Score** — Quadratisches Badge (grün ≥70, orange ≥40, rot <40) + relativer Score für alle Suchen
6. ✅ **Favoriten** — Herz-Button, in localStorage gespeichert
7. ✅ **Preisalarme** — Glocke-Button, Alert-Preis setzen, Telegram-Benachrichtigung (DB-persistiert)
8. ✅ **Suchalarm** — Neue Angebote unter Preisschwelle → Telegram
9. ✅ **Telegram-Einstellungen** — Chat-ID einmalig speichern + Test-Button
10. ✅ **Alerts-Liste** — Übersicht aller Alarme, löschen, manuell prüfen
11. ✅ **Watchlist** — Alle Favoriten mit Alert-Status
12. ✅ **Produktbilder** — Optional einblendbar (Checkbox)
13. ✅ **fly.io Deployment** — 24/7, persistent Volume, Telegram funktioniert
14. ✅ **eBay-Integration** — EbayScraper (API-First + Scraping-Fallback), eBay-Badge auf Produktkarte
15. ✅ **Sortierung** — Preis ↑↓, Deal-Score, Relevanz (SortBar, client-seitig)
16. ✅ **Preishistorie** — SQLite-Persistenz, `/price-history` API, PriceHistoryChart im Modal
17. ✅ **Produkt-Detail-Modal** — 2-Spalten Desktop, Slide-in Mobile, ESC/Klick-außen, Stats, Chart
18. ✅ **Scraper-Health** — ScraperLog in DB, `/api/health` API, Status-Dashboard in Einstellungen
19. ✅ **PostgreSQL-Support** — automatische URL-Erkennung, Migrations-Skript
20. ✅ **Web-Push / PWA** — Push-Subscriptions in DB, iOS-Install-Prompt
21. ✅ **Proxy-Rotation** — BaseScraper unterstützt PROXY_LIST Umgebungsvariable
22. ✅ **KI-Suchanfrage-Parser** — Groq llama-3.3-70b: optimized_query, condition, min/max_price, detected-Stichworte; `/api/parse-query` Endpunkt; KI-Badge in SearchBar (Hero + Compact)
23. ✅ **Modal Swipe-Down** — ProductDetailModal: Touch-Handler, 100px Threshold → schließen, Snap-Back
24. ✅ **Zustand-Filter** — FilterPanel Dropdown (Alle/Gebraucht/Neu), onConditionChange vollständig verdrahtet

---

## Alarm-System Logik

```
Preis-Alert:
  - Läuft dauerhaft bis manuell gelöscht (KEIN einmaliges Triggern mehr)
  - 24h Cooldown nach jeder Benachrichtigung (kein Spam)
  - Anzeige gelöscht (404) → Telegram-Nachricht + Alert automatisch entfernt

Suchalarm:
  - Prüft alle 30 Min nach neuen Angeboten
  - Speichert gesehene URLs (seen_urls) um Duplikate zu vermeiden
  - Läuft bis manuell gelöscht
```

---

## API-Endpunkte (Backend)

| Method | Endpoint | Beschreibung |
|--------|----------|--------------|
| POST | /search | Produkte suchen (sources-Parameter, parallel) |
| GET | /price-history | Preishistorie für eine URL abrufen |
| GET | /api/health | Scraper-Gesundheitsstatus (letzte 24h) |
| POST | /push-subscribe | Browser-Push-Subscription speichern |
| GET | /alerts | Alle Preisalarme abrufen |
| POST | /alerts | Neuen Preisalarm erstellen |
| DELETE | /alerts/\<id\> | Preisalarm löschen |
| POST | /alerts/check | Manuelle Prüfung aller Preisalarme |
| GET | /search-alerts | Alle Suchalarme abrufen |
| POST | /search-alerts | Neuen Suchalarm erstellen |
| DELETE | /search-alerts/\<id\> | Suchalarm löschen |
| POST | /search-alerts/check | Manuelle Prüfung aller Suchalarme |
| POST | /test-telegram | Test-Nachricht an Chat-ID senden |

---

## Deployment (fly.io)

```bash
# Deploy (braucht Docker Desktop für --local-only, sonst remote builder)
flyctl deploy

# Secrets setzen
flyctl secrets set TELEGRAM_BOT_TOKEN=xxx FLASK_ENV=production

# Logs ansehen
flyctl logs

# Volume für persistente Daten (price_alerts.json, search_alerts.json)
# Gemountet unter /data auf dem Server
```

**Wichtig:** Alerts und Preishistorie sind jetzt in SQLite/PostgreSQL gespeichert (`emirates_deals.db`). Bei fly.io muss das Volume für die DB-Datei eingerichtet sein.

---

## Entwicklungsworkflow

```bash
# Backend starten:
python main.py

# Frontend starten (separates Terminal):
cd frontend-react
npm run dev

# Oder alles auf einmal (Windows):
start-all.bat

# Telegram testen:
python test_telegram.py
```

---

## Architektur-Entscheidungen: Multi-Source (geplant)

### Warum Provider-Modell statt einzelne Funktionen?
Jede Plattform hat andere Auth, Rate-Limits, Formate und Fehlerquellen.
Eine gemeinsame Basisklasse erzwingt einheitliche Schnittstelle und verhindert Copy-Paste zwischen Scrapern.

### Warum API-First bei eBay/Amazon?
- Amazon-Scraping ist extrem instabil (Cloudflare, CAPTCHAs, JS-Rendering)
- eBay Finding API ist kostenlos und offiziell
- Scraping als Fallback bleibt möglich aber nicht als Primärlösung

### Warum `sources`-Parameter im Search-Endpunkt?
- Rückwärtskompatibel: Default `["kleinanzeigen"]` bricht nichts
- Ermöglicht gezielte Suche auf einer oder mehreren Plattformen
- Cache-Key muss `sources` enthalten (unterschiedliche Ergebnisse je Quelle)

### Header-Rotation Pflicht
Alle Scraper erben von BaseScraper, der Header-Rotation und zufällige Delays implementiert.
Kein Scraper macht Requests ohne diese Sicherheitsschicht.

---

## Offene TODOs (Priorität)

**Nice to have:**
- [ ] Zustand-Filter ("Neu"/"Gebraucht") — noch nicht implementiert
- [ ] Watchlist-Export als JSON/CSV
- [ ] Location + Datum scrapen: `sites/kleinanzeigen.py` → location/date aus HTML; `sites/ebay.py` → itemLocation aus API-Response

**Bereits erledigt (nicht mehr TODO):**
- ✅ Preishistorie — in DB + API + PriceHistoryChart
- ✅ Sortierung — SortBar (Preis ↑↓, Deal-Score, Relevanz)
- ✅ ProductDetailModal — vollständig implementiert
- ✅ Preisverlauf-Chart — SVG-basiert in ProductDetailModal
- ✅ KI-Suchanfrage-Parser — Groq llama-3.3-70b, `/api/parse-query`, KI-Badge in SearchBar
- ✅ Modal Swipe-Down — Touch-Handler in ProductDetailModal, 100px Threshold, Snap-Back
- ✅ FilterPanel Mobile-Scroll — `overflow-x-auto mobile-scroll-x` für Touch-Geräte
- ✅ Zustand-Filter — FilterPanel Dropdown, onConditionChange verdrahtet

---

## UI-Integration: Premium Design (Stand 20.02.2026)

### Analyse-Ergebnis: KEIN Framework-Wechsel nötig

| Aspekt | Premium UI (v0/Next.js) | Aktuelles Frontend | Aktion |
|--------|------------------------|-------------------|--------|
| Framework | Next.js 16 | React 19 + Vite | Vite bleibt, Next.js ignorieren |
| Tailwind | v4 | v4 | Identisch ✅ |
| Animationen | Native CSS | Native CSS | Identisch ✅ |
| Primary-Farbe | #00e5ff | #00f0ff (neon-cyan) | Angleichen |
| Accent | #7c3aed | #a855f7 (electric-purple) | Angleichen |
| Hintergrund | #050505 | #0a0b10 | Angleichen |
| shadcn/ui | 65 Komponenten | Keine | Nicht einbauen (overkill) |

### Was integriert wird (NUR Styling, KEINE Logik-Änderungen):
1. `index.css` → CSS-Variablen auf Premium-Werte angleichen
2. `App.jsx` → Ambient-Glow-Hintergrund (fixed blobs wie in page.tsx)
3. `Header.jsx` → Pill-Nav, Glassmorphism, fixed top
4. `SearchBar.jsx` → Hero-Search-Style (großes zentriertes Input mit Focus-Glow)
5. `CategoryGrid.jsx` → Bento-Grid-Layout
6. `StatsBar.jsx` → 4-Spalten-Grid mit Dividers

### Was NICHT geändert wird (Logic Layer):
- `useSearch.js`, `api/search.js`, `api/alerts.js`, `api/searchAlerts.js`
- `useFavorites.js`, `useNotificationSettings.jsx`
- `computeDealScore.js` und alle utils/data Files
- Gesamtes Python-Backend

---

## Workflow

**Nach jeder Aufgabe muss die `PROGRESS.md` aktualisiert werden.**

**Bevor eine Session beendet wird, muss eine Zusammenfassung des Ist-Zustands in die `PROGRESS.md` geschrieben werden, damit der Kontext für die nächste Session erhalten bleibt.**

Format für jeden Eintrag:
```
## [Datum] - [Kurzbeschreibung]
### Was gemacht wurde:
- ...
### Probleme/Besonderheiten:
- ...
### Nächster Schritt:
- ...
### Dateien geändert:
- ...
```

`PROGRESS.md` ist das lückenlose Protokoll aller Änderungen und das primäre Übergabedokument zwischen Sessions.

---

## Vorsichtshinweise

- `emirates_deals.db` enthält Telegram-IDs und Alerts → in .gitignore
- `.env` enthält Bot-Token → in .gitignore
- `build/`, `dist/`, `*.spec` → in .gitignore
- Scraper ohne Rate-Limiting — bei persönlichem Gebrauch kein Problem
