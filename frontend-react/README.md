# Emirates of Deals — Frontend

React 19 + Vite + Tailwind CSS v4 Frontend.

## Starten

```bash
npm run dev      # Dev-Server auf http://localhost:5173
npm run build    # Production Build
```

## Struktur

```
src/
  App.jsx                     # Haupt-App (Landing / Ergebnisse / Watchlist)
  components/
    SearchBar.jsx             # Hero + Compact Mode, KI-Parsing Badge
    FilterPanel.jsx           # Preis, Zustand, Fotos, eBay, Kategorie-Filter
    ProductCard.jsx           # Produktkarte (Favorit, Alarm, DealScore, Badge)
    ProductDetailModal.jsx    # Detail-Modal, Swipe-Down Mobile, Preishistorie
    ResultsGrid.jsx, SortBar.jsx, DealScore.jsx
    PriceTicker.jsx, DealCounter.jsx
    AlertDialog.jsx, SearchAlertDialog.jsx, AlertsListDialog.jsx
    SettingsDialog.jsx        # Telegram + Scraper-Health-Dashboard
    Watchlist.jsx
  hooks/
    useSearch.js, useFavorites.js, useNotificationSettings.jsx
  utils/
    computeDealScore.js, formatPrice.js, extractModel.js
  data/
    gpuBenchmarks.js, cpuBenchmarks.js, smartphoneBenchmarks.js, ramBenchmarks.js
    categoryFilters.js
  api/
    search.js, alerts.js, searchAlerts.js
```

## Proxy

Vite leitet `/api/*` und `/search` automatisch an `http://localhost:5000` weiter.
