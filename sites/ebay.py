import os
import re
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from sites.base_scraper import BaseScraper


class EbayScraper(BaseScraper):
    SOURCE = "ebay"
    API_ENDPOINT = "https://svcs.ebay.de/services/search/FindingService/v1"
    SCRAPE_URL = "https://www.ebay.de/sch/i.html"

    def search(self, query, location="", radius=50, start_page=1, batch_size=3, category=None, category_id=None, min_price=None, max_price=None):
        app_id = os.environ.get("EBAY_APP_ID", "").strip()
        if app_id:
            print(f"[ebay] Nutze Finding API")
            return self._search_api(query, start_page, batch_size, app_id)
        print(f"[ebay] Kein API-Key — nutze Scraping-Fallback")
        return self._search_scrape(query, start_page, batch_size)

    # ------------------------------------------------------------------ API
    def _search_api(self, query, start_page, batch_size, app_id):
        def fetch_page(page):
            params = {
                "OPERATION-NAME": "findItemsByKeywords",
                "SERVICE-VERSION": "1.0.0",
                "SECURITY-APPNAME": app_id,
                "RESPONSE-DATA-FORMAT": "JSON",
                "keywords": query,
                "paginationInput.pageNumber": page,
                "paginationInput.entriesPerPage": 25,
                "itemFilter(0).name": "ListingType",
                "itemFilter(0).value": "FixedPrice",
                "itemFilter(1).name": "MinPrice",
                "itemFilter(1).value": "2",
                "itemFilter(2).name": "Currency",
                "itemFilter(2).value": "EUR",
                "sortOrder": "PricePlusShippingLowest",
            }
            try:
                resp = requests.get(self.API_ENDPOINT, params=params, headers=self.get_headers(), timeout=10)
                data = resp.json()
                items = (
                    data.get("findItemsByKeywordsResponse", [{}])[0]
                    .get("searchResult", [{}])[0]
                    .get("item", [])
                )
                results = []
                for item in items:
                    try:
                        title = item["title"][0]
                        url = item["viewItemURL"][0]
                        price = float(item["sellingStatus"][0]["currentPrice"][0]["__value__"])
                        if price <= 1:
                            continue
                        image = item.get("galleryURL", [None])[0]
                        results.append(self.normalize({
                            "title": title,
                            "url": url,
                            "price": price,
                            "original": f"€{price:.2f}",
                            "image": image,
                        }))
                    except Exception:
                        continue
                return page, results
            except Exception as e:
                print(f"[ebay] API Fehler Seite {page}: {e}")
                return page, []

        return self._run_parallel(fetch_page, start_page, batch_size)

    # -------------------------------------------------------------- Scraping
    def _search_scrape(self, query, start_page, batch_size):
        def fetch_page(page):
            params = {
                "_nkw": query,
                "_pgn": page,
                "LH_BIN": 1,   # Nur Sofort-Kaufen (keine Auktionen)
                "_sop": 15,    # Sortierung: Preis + Versand (günstigste zuerst)
            }
            try:
                resp = requests.get(self.SCRAPE_URL, params=params, headers=self.get_headers(), timeout=10)
                soup = BeautifulSoup(resp.text, "lxml")
                results = []
                for item in soup.select("li.s-item"):
                    title_tag = item.select_one(".s-item__title")
                    price_tag = item.select_one(".s-item__price")
                    link_tag = item.select_one("a.s-item__link")
                    img_tag = item.select_one(".s-item__image-img")

                    if not (title_tag and price_tag and link_tag):
                        continue

                    title = title_tag.get_text(strip=True)
                    if not title or title.lower() == "shop on ebay":
                        continue

                    try:
                        price_text = price_tag.get_text(strip=True)
                        price_clean = price_text.replace("EUR", "").replace("€", "").replace("\xa0", "").strip()
                        # Deutsches Format: 1.299,00 → 1299.00
                        if "," in price_clean and "." in price_clean:
                            price_clean = price_clean.replace(".", "").replace(",", ".")
                        elif "," in price_clean:
                            price_clean = price_clean.replace(",", ".")
                        price = float(re.findall(r"\d+\.?\d*", price_clean)[0])
                        if price <= 1:
                            continue
                    except Exception:
                        continue

                    url_item = link_tag.get("href", "").split("?")[0]
                    image = None
                    if img_tag:
                        image = img_tag.get("src") or img_tag.get("data-src")

                    results.append(self.normalize({
                        "title": title,
                        "url": url_item,
                        "price": price,
                        "original": f"€{price:.2f}",
                        "image": image,
                    }))
                return page, results
            except Exception as e:
                print(f"[ebay] Scraping Fehler Seite {page}: {e}")
                return page, []

        return self._run_parallel(fetch_page, start_page, batch_size)

    # -------------------------------------------------------- Hilfsfunktion
    def _run_parallel(self, fetch_fn, start_page, batch_size):
        results_by_page = {}
        with ThreadPoolExecutor(max_workers=batch_size) as executor:
            futures = {executor.submit(fetch_fn, p): p for p in range(start_page, start_page + batch_size)}
            for future in as_completed(futures):
                page, page_results = future.result()
                if page_results:
                    results_by_page[page] = page_results

        results = []
        for page in sorted(results_by_page.keys()):
            results.extend(results_by_page[page])

        last_page = start_page + batch_size - 1
        has_more = last_page in results_by_page
        return results, has_more
