import os
import base64
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from sites.base_scraper import BaseScraper


class EbayScraper(BaseScraper):
    SOURCE = "ebay"
    TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token"
    SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search"

    def __init__(self):
        super().__init__()
        self._token = None
        self._token_expires_at = 0

    # ------------------------------------------------------------------ OAuth
    def _get_token(self):
        """Holt OAuth Application Token (Client Credentials). Cached bis Ablauf."""
        if self._token and time.time() < self._token_expires_at - 60:
            return self._token

        app_id = os.environ.get("EBAY_APP_ID", "").strip()
        cert_id = os.environ.get("EBAY_CERT_ID", "").strip()
        if not app_id or not cert_id:
            return None

        credentials = base64.b64encode(f"{app_id}:{cert_id}".encode()).decode()
        try:
            resp = requests.post(
                self.TOKEN_URL,
                headers={
                    "Authorization": f"Basic {credentials}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={
                    "grant_type": "client_credentials",
                    "scope": "https://api.ebay.com/oauth/api_scope",
                },
                timeout=10,
            )
            data = resp.json()
            self._token = data.get("access_token")
            expires_in = data.get("expires_in", 7200)
            self._token_expires_at = time.time() + expires_in
            print(f"[ebay] OAuth Token erhalten (läuft ab in {expires_in}s)")
            return self._token
        except Exception as e:
            print(f"[ebay] Token-Fehler: {e}")
            return None

    # ------------------------------------------------------------------ Search
    def search(self, query, location="", radius=50, start_page=1, batch_size=3,
               category=None, category_id=None, min_price=None, max_price=None):
        token = self._get_token()
        if not token:
            print("[ebay] Kein API-Token — eBay übersprungen")
            return [], False

        print(f"[ebay] Browse API Suche: '{query}'")

        def fetch_page(page):
            offset = (page - 1) * 50
            lo = int(min_price) if min_price is not None else 2
            hi = int(max_price) if max_price is not None else ""
            price_filter = f"price:[{lo}..{hi}]"
            filters = ["buyingOptions:{FIXED_PRICE}", price_filter, "priceCurrency:EUR"]

            params = {
                "q": query,
                "limit": 50,
                "offset": offset,
                "sort": "price",
                "filter": ",".join(filters),
            }
            headers = {
                "Authorization": f"Bearer {token}",
                "X-EBAY-C-MARKETPLACE-ID": "EBAY_DE",
                "Content-Type": "application/json",
            }
            try:
                resp = requests.get(self.SEARCH_URL, params=params, headers=headers, timeout=10)
                data = resp.json()
                if resp.status_code != 200:
                    print(f"[ebay] API Fehler {resp.status_code}: {data.get('errors', data)}")
                    return page, []

                items = data.get("itemSummaries", [])
                results = []
                for item in items:
                    try:
                        title = item.get("title", "")
                        url = item.get("itemWebUrl", "")
                        price_obj = item.get("price", {})
                        price = float(price_obj.get("value", 0))
                        if price <= 1:
                            continue
                        currency = price_obj.get("currency", "EUR")
                        image = None
                        img_list = item.get("image", {})
                        if img_list:
                            image = img_list.get("imageUrl")
                        results.append(self.normalize({
                            "title": title,
                            "url": url,
                            "price": price,
                            "original": f"€{price:.2f}" if currency == "EUR" else f"{price:.2f} {currency}",
                            "image": image,
                        }))
                    except Exception:
                        continue
                return page, results
            except Exception as e:
                print(f"[ebay] Seite {page} Fehler: {e}")
                return page, []

        # Parallel über batch_size Seiten
        results_by_page = {}
        with ThreadPoolExecutor(max_workers=batch_size) as executor:
            futures = {executor.submit(fetch_page, p): p for p in range(start_page, start_page + batch_size)}
            for future in as_completed(futures):
                page, page_results = future.result()
                if page_results:
                    results_by_page[page] = page_results

        results = []
        for page in sorted(results_by_page.keys()):
            results.extend(results_by_page[page])

        has_more = (start_page + batch_size - 1) in results_by_page
        return results, has_more
