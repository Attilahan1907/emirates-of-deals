# Emirates of Deals

Echtzeit-Preisvergleich und Deal-Alarm-Tool für Kleinanzeigen.de & eBay.

## Features

- **Preisvergleich** — Kleinanzeigen.de + eBay parallel, 3 Seiten gleichzeitig (~1-1.5s)
- **KI-Suchanfrage-Parser** — Natürliche Sprache wird automatisch in optimale Suchparameter umgewandelt (Groq llama-3.3-70b): Zustand, Preisrange, Stichwörter werden erkannt
- **Deal-Score** — Benchmark-basierte Preis-Leistungs-Bewertung (GPU / CPU / RAM / Smartphone)
- **Preis-Alarme** — Telegram-Benachrichtigung wenn der Preis unter eine Schwelle fällt (24h Cooldown, dauerhaft aktiv)
- **Suchalarme** — Benachrichtigung bei neuen Angeboten unter Preisschwelle
- **Watchlist / Favoriten** — localStorage + Backend-Sync
- **Produktdetail-Modal** — 2-Spalten Desktop, Swipe-Down auf Mobile, Preishistorie-Chart
- **Sortierung** — Preis ↑↓, Deal-Score, Relevanz
- **Filter** — Preis Min/Max, Zustand (Neu/Gebraucht), Fotos, eBay-Toggle, Kategorie-spezifische Filter
- **Scraper-Health-Dashboard** — Status aller Scraper in den Einstellungen
- **PWA / Web-Push** — iOS-Install-Prompt, Browser-Push-Notifications

## Tech Stack

| Schicht | Technologie |
|---------|------------|
| Backend | Python 3, Flask 3.0, BeautifulSoup4, concurrent.futures |
| KI | Groq API (llama-3.3-70b-versatile) |
| Cache | Redis (Upstash) mit in-memory Fallback |
| Frontend | React 19, Vite, Tailwind CSS v4, Lucide Icons |
| Notifications | Telegram Bot API, Web-Push |
| Storage | SQLite / PostgreSQL (SQLAlchemy) |
| Deployment | fly.io (24/7, persistent Volume) |

## Starten (lokal)

```bash
start-all.bat
```

Backend: http://localhost:5000 · Frontend: http://localhost:5173

## Umgebungsvariablen (.env)

```
TELEGRAM_BOT_TOKEN=...
GROQ_API_KEY=...          # optional, für KI-Parsing
EBAY_APP_ID=...           # optional, für eBay-Suche
UPSTASH_REDIS_URL=...     # optional, für Redis-Cache
```

## Deployment

```bash
flyctl deploy
flyctl secrets set TELEGRAM_BOT_TOKEN=xxx GROQ_API_KEY=xxx
```
