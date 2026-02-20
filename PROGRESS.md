# Emirates of Deals - Fortschrittsprotokoll

---

## [20.02.2026] - Sprint 1: Provider-Modell (BaseScraper + Refactoring)
### Was gemacht wurde:
- `sites/base_scraper.py` erstellt — abstrakte Basisklasse mit Header-Rotation (6 User-Agents) + random Delays
- `sites/kleinanzeigen.py` zu `KleinanzeigenScraper(BaseScraper)` umgebaut
- Backward-Compat gewahrt: `get_kleinanzeigen_results()` und `get_price_from_listing_url()` bleiben verfügbar
- `main.py`: Provider-Registry `PROVIDERS = {"kleinanzeigen": ...}` — eBay einfach einsteckbar
- `sources` Parameter im `/search` Endpunkt (Default: `["kleinanzeigen"]`)
- Cache-Key enthält jetzt `sources`
- Ergebnis-Format: `"source"` Feld auf jedem Item
### Dateien geändert:
- `sites/base_scraper.py` — neu
- `sites/kleinanzeigen.py` — Klasse statt Funktion
- `main.py` — Provider-Registry

---

## [20.02.2026] - v0 Design komplett ins Vite-Frontend übertragen
### Was gemacht wurde:
- `tw-animate-css` npm-Paket installiert
- `index.css`: v0 CSS-Variablen (--background, --primary, --muted-foreground etc.) + Tailwind `@theme inline` Block integriert; Legacy-Tokens (neon-cyan, electric-purple) bleiben kompatibel
- `App.jsx`: 3-Modi-Architektur (Landing / Ergebnisse / Watchlist)
  - Landing-Seite: exakt v0 `page.tsx` Layout (Badge, H1 Gradient, Subtitle, HeroSearch, statische Stats, CategoryGrid, Footer)
  - Ergebnis-Seite: Compact-Layout mit SearchBar + Ergebnissen
- `Header.jsx`: exakt v0 `header.tsx` Pill-Nav (Glassmorphism, Mobile-Menu) + unsere Action-Buttons (Settings/Alerts/Watchlist) statt Anmelden/Loslegen
- `SearchBar.jsx`: 2 Modi
  - Hero-Modus (!hasSearched): v0 `hero-search.tsx` rounded-full Pill + Standort-Zeile + Popular-Searches
  - Compact-Modus (hasSearched): bestehender Design mit allen Feldern
- `CategoryGrid.jsx`: v0 `category-grid.tsx` Bento-Grid `auto-rows-[140px]` + Subcategory-Panel unterhalb
- `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `components/*.tsx`: v0-Referenzdateien ans Projektwurzel kopiert
### Dateien geändert:
- `frontend-react/src/index.css`
- `frontend-react/src/App.jsx`
- `frontend-react/src/components/Header.jsx`
- `frontend-react/src/components/SearchBar.jsx`
- `frontend-react/src/components/CategoryGrid.jsx`
- `frontend-react/package.json` (tw-animate-css hinzugefügt)
- `app/` und `components/` (neue v0-Referenzdateien)

---

## [20.02.2026] - Sprint UI-1 bis UI-5: Premium Design Integration
### Was gemacht wurde:
- **index.css**: CSS-Variablen auf Premium-Werte aktualisiert (#050505 BG, #00e5ff Cyan, #7c3aed Violet), `.glass` verbessert, `.hover-lift` Utility hinzugefügt
- **App.jsx**: Ambient-Glow-Hintergrund (2 fixed Blobs Cyan + Violett), `relative z-10` für main, `pt-24` für fixed Header
- **Header.jsx**: Pill-Nav, fixed top, `backdrop-blur-xl`, Glassmorphism, kompakte Buttons
- **SearchBar.jsx**: Hero-Search-Style mit Focus-Glow, `isFocused`-State, Popular-Searches-Pills, Cyan Submit-Button mit Glow-Shadow
- **CategoryGrid.jsx**: Premium Bento-Grid, Hover-Blob-Effekt pro Karte, cubic-bezier Animationen
- **StatsBar.jsx**: 4-Spalten-Divider-Grid (`gap-px overflow-hidden`), kompaktes Layout
- **ProductCard.jsx**: `hover:-translate-y-0.5`, cubic-bezier Transition, neue Box-Shadow
### Dateien geändert:
- `frontend-react/src/index.css`
- `frontend-react/src/App.jsx`
- `frontend-react/src/components/Header.jsx`
- `frontend-react/src/components/SearchBar.jsx`
- `frontend-react/src/components/CategoryGrid.jsx`
- `frontend-react/src/components/StatsBar.jsx`
- `frontend-react/src/components/ProductCard.jsx`

---

## [20.02.2026] - Sprint 4+5: Normalisierung — Einheitlicher Deal-Score + Quell-Badge
### Was gemacht wurde:
- `ResultsGrid`: Deal-Score wird jetzt **immer** berechnet, nicht nur bei Benchmark-Kategorien
- Normale Suchen zeigen jetzt relative Deal-Scores (günstigstes = 100, teuerstes = 0)
- eBay + Kleinanzeigen Ergebnisse werden **gemeinsam** bewertet → echter Preisvergleich
- `ProductCard`: Kleines amber-farbiges "eBay" Badge neben Rangnummer wenn Quelle = eBay
- Kleinanzeigen-Items bekommen kein extra Badge (Standard)
### Dateien geändert:
- `frontend-react/src/components/ResultsGrid.jsx` — immer scores berechnen
- `frontend-react/src/components/ProductCard.jsx` — eBay Badge hinzugefügt

---

## [20.02.2026] - Sprint 2: EbayScraper (API-First + Scraping-Fallback)
### Was gemacht wurde:
- `sites/ebay.py` neu implementiert — `EbayScraper(BaseScraper)`, SOURCE = "ebay"
- **API-Modus:** eBay Finding API (kostenlos, ebay.de) — kein Konto nötig für Suche
- **Scraping-Fallback:** ebay.de HTML-Scraping wenn kein `EBAY_APP_ID` gesetzt
- Preisfilterung: nur Sofortkauf-Artikel (`LH_BIN=1`), Auktionen werden ignoriert
- Paralleles Laden (3 Seiten gleichzeitig) wie bei Kleinanzeigen
- `main.py`: eBay zu `PROVIDERS` hinzugefügt
- `FilterPanel`: "eBay einbeziehen" Checkbox (amber-farben)
- `SearchBar`: `sources`-Array an `onSearch()` weitergegeben
- `App.jsx`: `includeEbay` State, `handleSearch` leitet `sources` weiter
- `useSearch.js`: `sources` Parameter in `search()` + `loadMore()` gespeichert
- `api/search.js`: `sources` im POST-Body
- `.env.example`: `EBAY_APP_ID` Hinweis ergänzt
### Meilensteine:
- [x] **Sprint 1:** Refactoring — BaseScraper + Provider-Modell
- [x] **Sprint 2:** eBay-Provider (API-First, Scraping-Fallback)
- [ ] **Sprint 3:** ~~Amazon~~ (gestrichen — zu aufwendig/kostenpflichtig)
- [x] **Sprint 4:** Normalisierung — einheitlicher Deal-Score + Quell-Badge
- [x] **Sprint 5:** Frontend — Quell-Badge (eBay) auf Produktkarte (in Sprint 4 integriert)
### Dateien geändert:
- `sites/ebay.py` — neu implementiert
- `main.py` — EbayScraper in PROVIDERS
- `.env.example` — EBAY_APP_ID
- `frontend-react/src/components/FilterPanel.jsx` — eBay-Checkbox
- `frontend-react/src/components/SearchBar.jsx` — sources weitergeben
- `frontend-react/src/App.jsx` — includeEbay State
- `frontend-react/src/hooks/useSearch.js` — sources Parameter
- `frontend-react/src/api/search.js` — sources im POST-Body

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
