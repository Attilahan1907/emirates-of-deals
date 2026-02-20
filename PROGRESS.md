# BargainBot - Fortschrittsprotokoll

---

## [20.02.2026] - Planung: Multi-Source Erweiterung (eBay + Amazon)
### Status: PLANUNG — wartet auf OK
### Geplante Meilensteine:
- [ ] **Sprint 1:** Refactoring — BaseScraper + Provider-Modell (Kleinanzeigen bleibt kompatibel)
- [ ] **Sprint 2:** eBay-Provider (API-First, Scraping-Fallback)
- [ ] **Sprint 3:** Amazon-Provider (PA-API oder robuste Selektoren)
- [ ] **Sprint 4:** Normalisierung — einheitlicher Deal-Score für alle Quellen
- [ ] **Sprint 5:** Frontend — Quell-Badge (eBay/Amazon/Kleinanzeigen) auf Produktkarte
### Dateien geplant:
- `sites/base_scraper.py` — neu
- `sites/kleinanzeigen.py` — Umbau zu Klasse
- `sites/ebay.py` — neu implementieren
- `sites/amazon.py` — neu implementieren
- `main.py` — Provider-Registry einbauen

---

## [20.02.2026] - Pagination + Caching
### Was gemacht wurde:
- Scraper lädt jetzt in Batches (3 Seiten gleichzeitig, ~1s pro Batch)
- In-Memory Cache im Backend (5 Min TTL) → wiederholte Suchen sofort
- "Mehr laden" Button lädt jeweils nächste 3 Seiten nach
- `has_more` Flag zeigt ob weitere Seiten vorhanden sind
### Dateien geändert:
- `main.py` — Cache-Logik, `start_page`/`batch_size` Parameter
- `sites/kleinanzeigen.py` — `start_page` Parameter, gibt `(results, has_more)` zurück
- `frontend-react/src/api/search.js` — neue Parameter
- `frontend-react/src/hooks/useSearch.js` — `loadMore`, `hasMore`, `loadingMore` zurück
- `frontend-react/src/components/ResultsGrid.jsx` — "Mehr laden" Button
- `frontend-react/src/App.jsx` — neue Props verdrahtet

---

## [20.02.2026] - Großes Feature-Update (Alarm-System, UI, Deployment)
### Was gemacht wurde:
- **Alarm-System komplett:** Preis-Alerts laufen dauerhaft (kein einmaliges Triggern), 24h Cooldown
- **Gelöschte Anzeigen:** Bei 404 → Telegram-Nachricht + Alert automatisch entfernt
- **Suchalarm:** Benachrichtigung bei neuen Angeboten unter Preisschwelle
- **Telegram Test-Button** in Einstellungen
- **Einstellungen-Dialog:** Chat-ID einmalig speichern
- **Alerts-Liste:** Alle Alarme anzeigen, löschen, manuell prüfen
- **Watchlist:** Merkliste mit Alert-Status
- **Produktbilder:** Optional einblendbar (Checkbox im Filter)
- **DealScore:** Quadratisches Badge statt Kreis
- **Score-Überlappung** mit Buttons behoben (`pr-20`)
- **Deutschlandweit** als Standard-Einstellung (Radius nur aktiv wenn PLZ eingegeben)
- **fly.io Deployment:** 24/7, persistentes Volume für JSON-Dateien
- **Paralleles Scraping** (3 Seiten gleichzeitig, ~1s statt ~5s)
- **Kein Infinite Scroll** mehr — alle Ergebnisse sofort geladen
### Dateien geändert:
- `main.py`, `price_monitor.py`, `notifications.py`, `config.py`
- `sites/kleinanzeigen.py`
- `frontend-react/src/App.jsx`
- `frontend-react/src/components/` — Header, SearchBar, FilterPanel, ProductCard, ResultsGrid, DealScore, AlertDialog, AlertsListDialog, SearchAlertDialog, SettingsDialog, Watchlist
- `frontend-react/src/hooks/` — useSearch, useFavorites, useNotificationSettings
- `frontend-react/src/api/` — alerts.js, searchAlerts.js
- `Dockerfile`, `fly.toml`, `.github/workflows/fly-deploy.yml`

---

## [19.02.2026] - Initialer Upload + frühe Features
### Was gemacht wurde:
- Grundstruktur: Flask Backend + React Frontend
- Kleinanzeigen.de Scraper (BeautifulSoup)
- Deal-Score Algorithmus (GPU/CPU/RAM/Smartphone Benchmarks)
- Kategorien-Grid mit Sub-Kategorien
- Suchleiste mit Ort/Umkreis Filter
- "1€ Placeholder"-Angebote herausgefiltert
- Deutschlandweit-Option im Radius-Dropdown
- Location-Filter via `locationStr` Query-Parameter
### Dateien geändert:
- Initialer Commit aller Basisdateien
