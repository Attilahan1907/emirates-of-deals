# Emirates of Deals - Project Overview & Instructions

## Project Overview
"Emirates of Deals" is a high-end price comparison and monitoring platform focusing on the German market (Kleinanzeigen.de and eBay). It features a "Deal-Score" algorithm for technical products (GPU, CPU, RAM, Smartphone) and a robust background monitoring system for price drops and new search results.

### Tech Stack
- **Backend:** Python (Flask), SQLAlchemy (SQLite/PostgreSQL), BeautifulSoup4, Requests.
- **Frontend:** React 19 (Vite), Tailwind CSS 4, Lucide Icons.
- **Persistence:** SQL Database (Local: SQLite `emirates_deals.db`), JSON caching.
- **Deployment:** Docker, Fly.io support.
- **Integrations:** Telegram Bot, WhatsApp (Twilio), Browser Push (PWA).

### Architecture
- `main.py`: Central API entry point and static file server.
- `database.py`: SQLAlchemy models and session management.
- `price_monitor.py`: Background threads for monitoring price and search alerts.
- `sites/`: Scraper implementations (BaseScraper, Kleinanzeigen, Ebay).
- `frontend-react/`: Modern React application with a premium "Glassmorphism" UI.

---

## Strategic Roadmap (Foundational Mandates)
Follow these priorities for future development:
1. **Scraper Stability:** [COMPLETED] Robust parsing (BaseScraper), Health Monitoring (ScraperLogger) with DB persistence, and Health API.
2. **User Engagement:** Browser-Push (PWA), Price History visualization, and Telegram integration.
3. **Scalability:** [COMPLETED] Multi-DB support (PostgreSQL/SQLite), Migration Script, and Proxy Rotation.
4. **SEO & Mobile UX:** Implement SSR/Next.js transition and native mobile gestures (WIP).

---

## Building and Running

### Development
1. **Environment Setup:**
   - Install dependencies: `pip install -r requirements.txt`
   - Create/Update `.env` based on `.env.example`.
2. **Start Backend:**
   - Run `python main.py`. (Initializes DB automatically).
3. **Start Frontend:**
   - `cd frontend-react`
   - `npm install`
   - `npm run dev`
4. **Full Stack Start:**
   - Execute `start-all.bat` from the root.

### Deployment / Production
- **Build Frontend:** `cd frontend-react && npm run build`. Dist files go to `frontend-react/dist`.
- **Server:** Flask serves the `dist` folder.
- **Database Migration:** Run `python migrate_to_db.py` if JSON legacy files are present.

---

## Development Conventions

### Coding Style
- **Python:** Use `sites/utils.py` for shared logic (parsers, loggers). Adhere to functional patterns for scrapers.
- **React:** Component-based architecture in `src/components`. Use custom hooks (`src/hooks`) for state logic (Favorites, Search, Notifications).
- **Styling:** Follow the "Premium Design" tokens in `frontend-react/src/index.css`. Prefer Tailwind utility classes.

### Scraper Best Practices
- **Respectful Scraping:** Always use `BaseScraper` for header rotation and random delays.
- **Filtering:** Use `is_relevant` from `sites.utils` to prevent junk items (like postcards) from cluttering tech results.
- **Price Parsing:** Always use `PriceParser.parse()` to handle German thousands-separators correctly.

### Database Operations
- All new persistent data must be modeled in `database.py`.
- Use the `SessionLocal` context manager for database operations to ensure connections are closed.

---

## Key Files
- `GEMINI.md`: This instruction context file.
- `PROGRESS.md`: Detailed history of sprints and changes.
- `CLAUDE.md`: Build/Run reference.
- `sites/utils.py`: Centralized logic for price parsing and relevance filtering.
- `database.py`: SQL schema definition.
