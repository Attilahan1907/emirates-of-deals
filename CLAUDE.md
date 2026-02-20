# BargainBot - Projektdokumentation für Claude

## Projektstatus: Stand 20.02.2026

---

## Was ist BargainBot?

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
| Backend | Python, Flask 3.0, BeautifulSoup4, concurrent.futures |
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Notifications | Telegram Bot API |
| Storage | JSON (backend alerts auf /data), localStorage (frontend favorites) |
| Deployment | fly.io (24/7, persistent Volume für JSON-Dateien) |

**Starten lokal:** `start-all.bat` → Backend auf http://localhost:5000, Frontend auf http://localhost:5173

---

## Wichtige Dateipfade

```
main.py                          # Flask API (alle Endpunkte)
price_monitor.py                 # Hintergrund-Monitoring (alle 30 Min.)
notifications.py                 # Telegram Versand
config.py                        # .env laden + Setup-Routine
SETUP_ALERTS.md                  # Setup-Anleitung für Notifications
requirements.txt                 # Python-Abhängigkeiten
start-all.bat                    # Windows-Startskript für beide Server
fly.toml                         # fly.io Deployment-Konfiguration
Dockerfile                       # Multi-stage Build (Node → Python)

sites/
  kleinanzeigen.py               # Aktiver Scraper (paralleles Scraping, 3 Seiten)
  amazon.py, ebay.py, daraz.py   # PLACEHOLDER - noch nicht implementiert

frontend-react/src/
  App.jsx                        # Haupt-App-Komponente
  api/
    search.js                    # Suche API-Client
    alerts.js                    # Preisalarme API-Client
    searchAlerts.js              # Suchalarme API-Client
  components/
    Header.jsx                   # Logo + Watchlist + Settings + Alerts Buttons
    SearchBar.jsx                # Suchleiste (Deutschlandweit default, Radius nur mit PLZ)
    FilterPanel.jsx              # Preis-Filter + Fotos-Toggle
    ProductCard.jsx              # Produktkarte (Favorit-Herz, Alarm-Glocke, DealScore-Badge)
    ResultsGrid.jsx              # Ergebnisgrid (alle Ergebnisse auf einmal)
    DealScore.jsx                # Quadratisches Score-Badge (grün/orange/rot)
    Watchlist.jsx                # Merkliste-Ansicht
    AlertDialog.jsx              # Preisalarm-Dialog (Telegram, auto Chat-ID)
    AlertsListDialog.jsx         # Alle Alarme anzeigen/löschen (2 Tabs)
    SearchAlertDialog.jsx        # Suchalarm erstellen
    SettingsDialog.jsx           # Telegram Chat-ID + Test-Button
    StatsBar.jsx, EmptyState.jsx, LoadingState.jsx, CategoryGrid.jsx, BestDealBadge.jsx
  hooks/
    useSearch.js                 # Such-State-Management (vereinfacht, kein Paging)
    useFavorites.js              # Favoriten (localStorage + Backend-Sync)
    useNotificationSettings.jsx  # Telegram Chat-ID (React Context + localStorage)
  utils/
    computeDealScore.js          # Deal-Score-Algorithmus
    computeStats.js, formatPrice.js, extractModel.js
  data/
    gpuBenchmarks.js, cpuBenchmarks.js, smartphoneBenchmarks.js, ramBenchmarks.js
```

---

## Implementierte Features (vollständig)

1. ✅ **Suche** — Kleinanzeigen.de scrapen, 3 Seiten parallel, alle Ergebnisse auf einmal
2. ✅ **Filter** — Preis (Min/Max), Umkreis (nur aktiv wenn PLZ eingegeben), Fotos ein/aus
3. ✅ **Standardeinstellung** — "Deutschlandweit" beim Laden (kein PLZ nötig)
4. ✅ **Kategorien** — GPU/CPU/RAM/Smartphone mit Benchmark-Score
5. ✅ **Deal-Score** — Quadratisches Badge (grün ≥70, orange ≥40, rot <40)
6. ✅ **Favoriten** — Herz-Button, in localStorage gespeichert
7. ✅ **Preisalarme** — Glocke-Button, Alert-Preis setzen, Telegram-Benachrichtigung
8. ✅ **Suchalarm** — Neue Angebote unter Preisschwelle → Telegram
9. ✅ **Telegram-Einstellungen** — Chat-ID einmalig speichern + Test-Button
10. ✅ **Alerts-Liste** — Übersicht aller Alarme, löschen, manuell prüfen
11. ✅ **Watchlist** — Alle Favoriten mit Alert-Status
12. ✅ **Produktbilder** — Optional einblendbar (Checkbox)
13. ✅ **Statistiken** — Best Price, Avg, Ersparnis
14. ✅ **fly.io Deployment** — 24/7, persistent Volume, Telegram funktioniert

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
| POST | /search | Produkte suchen (alle Ergebnisse, kein Paging) |
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

**Wichtig:** `price_alerts.json` und `search_alerts.json` liegen auf dem fly.io Volume unter `/data` — bleiben bei Re-Deploys erhalten.

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

## Offene TODOs (Priorität)

**Nice to have:**
- [ ] Preishistorie speichern (SQLite oder JSON-Append)
- [ ] Sortierung der Ergebnisse (Preis ↑↓, Deal-Score, neueste zuerst)
- [ ] Zustand-Filter ("Neu"/"Gebraucht")
- [ ] Watchlist-Export als JSON/CSV
- [ ] Weitere Plattformen (willhaben.at, eBay)

---

## Vorsichtshinweise

- `price_alerts.json` und `search_alerts.json` enthalten Telegram-IDs → in .gitignore
- `.env` enthält Bot-Token → in .gitignore
- `build/`, `dist/`, `*.spec` → in .gitignore
- Scraper ohne Rate-Limiting — bei persönlichem Gebrauch kein Problem
