## [05.03.2026] - Mobile UX + Modal Swipe-Down + Aufräumen

### Was gemacht wurde:
- **`ProductDetailModal.jsx`:** Touch-Handler (`handleTouchStart/Move/End`) + `dragY`/`isDragging` State + `useRef` für `touchStartY`; Modal-Panel bekommt `style.transform: translateY(dragY)` + `transition: none` während Drag; ab 100px Downward-Drag → `handleClose()`, danach Snap-Back
- **`frontend-react/src/index.css`:** `.mobile-scroll-x` Utility-Klasse hinzugefügt (`-webkit-overflow-scrolling: touch`, `scrollbar-width: none`, `::-webkit-scrollbar { display: none }`)
- **`FilterPanel.jsx`:** Filter-Container bekommt `overflow-x-auto mobile-scroll-x` für flüssiges horizontales Scrollen auf Mobile
- **`CLAUDE.md`:** `willhaben.at` aus TODOs entfernt
- **`onConditionChange`:** Bereits vollständig verdrahtet (kein Fix nötig)

### Probleme/Besonderheiten:
- Modal-Panel hatte `transition-all` im className — bei Drag wird `transition: none` via inline style überschrieben, danach 0.3s ease-out für Snap-Back
- Klassen-basierte Transition und inline-style-Transition kombinieren sich korrekt (inline-style hat Vorrang)

### Nächster Schritt:
- Testen auf Mobile / DevTools Mobile Simulation
- KI-Parsing auf echter Groq-API testen (GROQ_API_KEY nötig)

### Dateien geändert:
- `frontend-react/src/components/ProductDetailModal.jsx`
- `frontend-react/src/components/FilterPanel.jsx`
- `frontend-react/src/index.css`
- `CLAUDE.md`

## [05.03.2026] - KI-gestützte Suchanfrage-Analyse (Natural Language Query Parsing)

### Was gemacht wurde:
- **`main.py`:** `parse_natural_query(raw_query)` Funktion — sendet Query an Groq llama-3.3-70b, extrahiert `optimized_query`, `condition`, `min_price`, `max_price`, `detected`; neuer Endpunkt `POST /api/parse-query`
- **`frontend-react/src/components/SearchBar.jsx`:** `handleSubmit` async gemacht; bei >= 2 Wörtern: KI-Parsing via `/api/parse-query`; Query-Feld, Condition, Min/MaxPrice werden automatisch befüllt; KI-Badge ("KI erkannt: Benziner, 4-Türer") in Hero- und Compact-Mode

### Verifikation:
1. Backend neu starten
2. "Fiat Punto 2009 benziner 4 türen" eingeben → KI-Badge mit "Benziner", "4-Türer" erscheint
3. Suchfeld zeigt optimierten Query "Fiat Punto 2009"
4. "RTX 3080 unter 400€" → MaxPrice-Feld füllt sich auf 400
5. Einfaches "iPhone" → kein KI-Badge, normale Suche

### Voraussetzung:
- `GROQ_API_KEY` in `.env` eintragen (benötigt für Parsing; ohne Key: normale Suche, kein Badge)

### Nächster Schritt:
- Testen mit komplexen Suchanfragen
- Ggf. Zustand-Filter im FilterPanel mit `condition`-Prop verknüpfen (falls noch nicht vorhanden)

### Dateien geändert:
- `main.py`
- `frontend-react/src/components/SearchBar.jsx`

---

## [05.03.2026] - KI-Deal-Analyse via Gemini API

### Was gemacht wurde:
- **`sites/utils.py`:** `"vb"` aus `PriceParser.EXCLUDE_KEYWORDS` entfernt → VB-Preise werden jetzt geparst
- **`sites/kleinanzeigen.py`:** VB-Erkennung in `_parse_page()` — `is_vb`-Flag, `original`-Feld zeigt "VB" wenn zutreffend
- **`requirements.txt`:** `google-generativeai>=0.8.0` hinzugefügt
- **`main.py`:** `analyze_with_ai(listings)` Funktion — sendet Top-10-Listings an Gemini 2.0 Flash Lite, parst JSON-Antwort; in `/search`-Route: `ai_insight` wird nach Sortierung berechnet und in `response_data` + Cache gespeichert
- **`useSearch.js`:** `aiInsight` State ergänzt, wird bei `search()` gesetzt und bei `reset()` geleert
- **`App.jsx`:** AI-Banner zwischen SearchBar und SortBar — Glassmorphism-Card mit 🤖-Icon, Summary-Text, Best-Deal-Link und Scam-Warning-Pills

### Env-Variable:
- `GEMINI_API_KEY=AIza...` in `.env` eintragen (kostenlos: aistudio.google.com/apikey)
- Ohne Key: `ai_insight` ist null, Banner wird nicht angezeigt

### Nächster Schritt:
- `pip install -r requirements.txt` ausführen
- `.env` mit `GEMINI_API_KEY` ergänzen
- Testen: RTX 3080 suchen → DevTools Response prüfen, AI-Banner sichtbar?

### Dateien geändert:
- `sites/utils.py`
- `sites/kleinanzeigen.py`
- `requirements.txt`
- `main.py`
- `frontend-react/src/hooks/useSearch.js`
- `frontend-react/src/App.jsx`

---

## [05.03.2026] - Autos-Filter: Marke (Logo-Grid), Baujahr ab, KM-Stand bis

### Was gemacht wurde:
- **`categoryFilters.js`:** 3 neue Filter für Autos-Kategorie (ID 216) ergänzt:
  - `autos.marke_s` (type: `brand_grid`) — 18 Marken mit Wikipedia-SVG-Logos
  - `autos.baujahr_i` (type: `range_from`) — 7 Optionen "Ab Jahr", values als `"2020:"` (Range-Format für Kleinanzeigen-URL)
  - `autos.kilometer_i` (type: `range_to`) — 6 Optionen "Bis X km", values als `":50000"`
- **`FilterPanel.jsx`:** Neuer Rendering-Zweig für `brand_grid`:
  - Logo-Grid (6 Spalten mobile, 9 Spalten desktop) mit Toggle-Verhalten
  - Gewählte Marke: neon-cyan Border + Hintergrund
  - Logo lädt nicht → wird per `onError` ausgeblendet
  - Dropdown- und Range-Filter in gemeinsamer Zeile
- **Backend:** Keine Änderung nötig — `+key:value` Format im existing `k_suffix`-Loop reicht

### Nächster Schritt:
- Verifikation: Autos-Kategorie wählen, 8 Filter prüfen, Marke + Baujahr + KM kombinieren

### Dateien geändert:
- `frontend-react/src/data/categoryFilters.js`
- `frontend-react/src/components/FilterPanel.jsx`

---

## [05.03.2026] - Prio 3: SW Offline-Caching, Location/Datum scrapen, Backend-Sortierung

### Was gemacht wurde:
- **Service Worker Offline-Caching (Task A):** `sw.js` um `install`, `activate` und `fetch` Events erweitert. App-Shell wird gecacht, API-Calls gehen immer ans Netz, alle anderen Assets nutzen Stale-While-Revalidate. Alte Cache-Versionen werden beim Aktivieren gelöscht.
- **Kleinanzeigen Datum (Task B1):** `_parse_page()` extrahiert jetzt Datum aus `.aditem-main--top--right` als roher String (`"Heute, 14:30"`, `"02.03.2026"` etc.) → Feld `"date"` im Ergebnis.
- **eBay Location + Datum (Task B2):** `ebay.py` extrahiert `itemLocation.city/country` → `"location"` und `itemCreationDate` → `"date"` aus der eBay Browse API Response.
- **ProductCard location/date (Task B3):** `ProductCard.jsx` zeigt `MapPin`+Ort und `Clock`+Datum als kleine Zeile unter dem Titel an (nur wenn Wert vorhanden).
- **Backend-Sortierung (Task C):** `/search` Endpunkt unterstützt optionalen `sort_by` Parameter (`"price_asc"`, `"price_desc"`). Cache-Key enthält `sort_by`. Deal-Score-Sortierung bleibt weiterhin nur im Frontend.

### Dateien geändert:
- `frontend-react/public/sw.js` (install + fetch + activate Events)
- `sites/kleinanzeigen.py` (`_parse_page()` +date)
- `sites/ebay.py` (`fetch_page()` +location, +date)
- `frontend-react/src/components/ProductCard.jsx` (+MapPin/Clock Icons, +location/date Anzeige)
- `main.py` (`/search` +sort_by Parameter + Cache-Key)

### Nächster Schritt:
- `flyctl deploy` für Production-Deploy
- SW in DevTools testen (Application → Service Workers)

## [05.03.2026] - Release-Vorbereitung: 7 Features implementiert

### Was gemacht wurde:
- **Dockerfile-Fix:** `COPY --from=frontend-builder /app/frontend-react/dist` → `/app/dist` (Build-Fehler behoben)
- **PriceHistoryChart:** Echter SVG-Liniengraph implementiert (SparklineSVG-Komponente, ~50 Zeilen, keine externe Bibliothek). Zeigt jetzt echten Preisverlauf im Tooltip mit Farbkodierung (grün=sinkend, rot=steigend).
- **DealCounter:** Hardcoded 47.382 durch dynamische Berechnung ersetzt. Startwert 38.500 + 480 Deals/Tag seit Launch-Datum (15.01.2025). Wächst täglich automatisch.
- **PriceTicker:** Fetcht jetzt `/api/trending` beim Mount und zeigt echte gesehene Produkte. Fallback auf statische Demo-Daten wenn Endpoint leer.
- **`/api/trending` Endpunkt:** In `main.py` implementiert. In-memory Deque (maxlen=60) sammelt Items aus Suchergebnissen. Dedupliziert nach Titel.
- **`/api/config` Endpunkt:** Gibt `{"ebay_available": bool}` zurück basierend auf `EBAY_APP_ID` Env-Var.
- **Zustand-Filter ("Neu"/"Gebraucht"):** Dropdown in FilterPanel → `condition` Parameter durch gesamten Stack (FilterPanel → SearchBar → App → useSearch → search.js → main.py → kleinanzeigen.py → `+zustand:neu/gebraucht` in URL).
- **eBay Fallback-UX:** eBay-Toggle wird greyed out + zeigt "(kein API-Key)" wenn `EBAY_APP_ID` nicht gesetzt. App fetcht `/api/config` einmalig beim Mount.
- **Watchlist-Export:** JSON und CSV Export-Buttons in Watchlist-Header. Client-seitig, kein Backend nötig.

### Dateien geändert:
- `Dockerfile`
- `main.py` (+trending, +config, +condition, +_recent_items Deque)
- `sites/kleinanzeigen.py` (+condition Parameter → k_suffix)
- `frontend-react/src/components/PriceHistoryChart.jsx` (komplett neu: SVG-Graph)
- `frontend-react/src/components/DealCounter.jsx` (dynamischer Startwert)
- `frontend-react/src/components/PriceTicker.jsx` (fetch trending + fallback)
- `frontend-react/src/components/FilterPanel.jsx` (+Zustand-Dropdown, +eBay-greyed-out, +ebayAvailable prop)
- `frontend-react/src/components/SearchBar.jsx` (+ebayAvailable, +condition props)
- `frontend-react/src/components/Watchlist.jsx` (+Export JSON/CSV)
- `frontend-react/src/hooks/useSearch.js` (+condition Parameter)
- `frontend-react/src/api/search.js` (+condition in body)
- `frontend-react/src/App.jsx` (+condition State, +ebayAvailable State, +/api/config fetch, +alle search() Aufrufe aktualisiert)

### Nächster Schritt:
- `flyctl deploy` um Production-Deploy zu testen
- Verifikationscheckliste aus Release-Plan abarbeiten

---

## [05.03.2026] - Dokumentation aktualisiert (CLAUDE.md + PROGRESS.md)
### Was gemacht wurde:
- CLAUDE.md auf echten Stand gebracht (war veraltet seit 24.02.2026)
- Fehlende Komponenten nachgetragen: ProductDetailModal, PriceHistoryChart, SortBar, PriceTicker, DealCounter, IOSInstallPrompt, Sparkline
- Fehlende Backend-Dateien nachgetragen: database.py, cache.py, sites/price_history.py, sites/utils.py
- Falsche Angabe korrigiert: ebay.py war als "PLACEHOLDER" markiert, ist aber vollständig implementiert
- Feature-Liste auf 21 vollständige Features aktualisiert
- API-Endpunkte um /price-history, /api/health, /push-subscribe ergänzt
- TODO-Liste bereinigt (Sortierung, ProductDetailModal, PriceHistoryChart als erledigt markiert)
- React 18 → React 19, Tailwind CSS → Tailwind CSS v4 korrigiert
### Dateien geändert:
- `CLAUDE.md`
- `PROGRESS.md`

---

## [22.02.2026] - Sprint: Scalability & Reliability (Abschluss Prio 3)
### Was gemacht wurde:
- **PostgreSQL Support:** `database.py` erkennt jetzt automatisch Postgres-URLs und passt Prefixe (`postgres://` -> `postgresql://`) an.
- **Migrations-Tool:** `migrate_to_postgres.py` erstellt, um bestehende SQLite-Daten verlustfrei in Postgres zu überführen.
- **Proxy Management:** `BaseScraper` unterstützt jetzt Proxy-Rotation via `PROXY_LIST` Umgebungsvariable.
- **Robust Scraper:** `fetch_url` im BaseScraper zentralisiert HTTP-Requests mit Retries, User-Agent-Rotation und Proxy-Support.
- **Notification Upgrade:** Web-Push (PWA) Versand im Backend implementiert (`notifications.py`) und in Monitoring integriert.
- **Auto-History:** Jede Suche zeichnet jetzt automatisch die Preise in der Historie auf.
### Dateien geändert:
- `database.py`, `main.py`, `notifications.py`, `price_monitor.py`
- `sites/base_scraper.py`, `sites/kleinanzeigen.py`
- `migrate_to_postgres.py` (neu), `requirements.txt` (aktualisiert)

---

## [22.02.2026] - Sprint: Scraper Health Monitoring (Abschluss Prio 1)
### Was gemacht wurde:
- **Datenbank-Logging:** Neue Tabelle `ScraperLog` in `database.py` speichert Erfolg, Fehler und 429-Rate-Limits dauerhaft.
- **ScraperLogger-Upgrade:** `sites/utils.py` Logger schreibt jetzt direkt in die DB statt nur in die Konsole.
- **Health API:** Neuer Endpunkt `/api/health` berechnet die Erfolgsrate (Success Rate) der letzten 24 Stunden pro Provider.
- **Frontend Status-Dashboard:** Im Einstellungen-Dialog werden jetzt Echtzeit-Statuskarten für eBay und Kleinanzeigen angezeigt (Erfolgsquote + farbiger Indikator).
### Dateien geändert:
- `database.py` (ScraperLog Modell)
- `sites/utils.py` (Logger Upgrade)
- `main.py` (/api/health Endpunkt)
- `frontend-react/src/components/SettingsDialog.jsx` (Health UI)

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
