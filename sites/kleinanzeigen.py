from bs4 import BeautifulSoup
import requests
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from sites.base_scraper import BaseScraper
from sites.utils import PriceParser, ScraperLogger, is_relevant

def _parse_page(soup, query, category=None, has_category_id=False):
    results = []
    for item in soup.select("article.aditem"):
        title_tag = item.select_one(".text-module-begin a")
        price_tag = item.select_one(".aditem-main--middle--price-shipping--price")
        if not (title_tag and price_tag):
            continue
        title = title_tag.text.strip()
        if not is_relevant(title, query, category, has_category_id):
            continue
        href = title_tag.get("href", "")
        link = "https://www.kleinanzeigen.de" + href if href.startswith("/") else href
        price_text = price_tag.text.strip()
        is_vb = "vb" in price_text.lower()
        price = PriceParser.parse(price_text)
        if price is None or price <= 1:
            continue

        img_tag = item.select_one(".imagebox img")
        image_url = None
        if img_tag:
            image_url = img_tag.get("data-src") or img_tag.get("src")
        # Location aus top-left extrahieren (erste nicht-leere Zeile)
        location_tag = item.select_one(".aditem-main--top--left")
        location_text = ""
        if location_tag:
            for line in location_tag.get_text("\n").split("\n"):
                line = line.strip()
                if line:
                    location_text = line
                    break

        # Datum aus top-right extrahieren
        date_tag = item.select_one(".aditem-main--top--right")
        date_text = date_tag.get_text(strip=True) if date_tag else ""

        results.append({
            "title": title,
            "url": link,
            "price": price,
            "original": f"€{price:.2f} VB" if is_vb else f"€{price:.2f}",
            "image": image_url,
            "location": location_text,
            "date": date_text,
        })
    return results


class KleinanzeigenScraper(BaseScraper):
    SOURCE = "kleinanzeigen"

    def search(self, query, location="", radius=50, start_page=1, batch_size=3, category=None, category_id=None, min_price=None, max_price=None, category_filters=None, condition=""):
        query_encoded = query.replace(" ", "-") if query else ""
        location_encoded = location.strip().replace(" ", "-").lower()
        k_suffix = f"k0c{category_id}" if category_id else "k0"
        if category_filters:
            for key, value in category_filters.items():
                if value:
                    k_suffix += f"+{key}:{value}"
        if condition in ("neu", "gebraucht"):
            k_suffix += f"+zustand:{condition}"

        # Preis nativ über URL filtern (serverseitig, weniger irrelevante Ergebnisse)
        if min_price is not None or max_price is not None:
            price_from = int(min_price) if min_price else ""
            price_to = int(max_price) if max_price else ""
            k_suffix += f"+preis:{price_from}:{price_to}"

        params = {}
        if location_encoded and radius != 0:
            params["locationStr"] = location.strip()
            params["radius"] = radius

        def fetch_page(page):
            if query_encoded:
                url = (
                    f"https://www.kleinanzeigen.de/s-{query_encoded}/{k_suffix}"
                    if page == 1
                    else f"https://www.kleinanzeigen.de/s-seite:{page}/{query_encoded}/{k_suffix}"
                )
            else:
                url = (
                    f"https://www.kleinanzeigen.de/s-anzeigen/{k_suffix}"
                    if page == 1
                    else f"https://www.kleinanzeigen.de/s-anzeigen/seite:{page}/{k_suffix}"
                )
            try:
                html = self.fetch_url(url, params=params)
                if not html:
                    return page, []
                
                soup = BeautifulSoup(html, "lxml")
                results = _parse_page(soup, query or "", category, bool(category_id))
                ScraperLogger.log_success(self.SOURCE, page, len(results))
                return page, results
            except Exception as e:
                ScraperLogger.log_error(self.SOURCE, page, e)
                return page, []

        pages = range(start_page, start_page + batch_size)
        results_by_page = {}
        with ThreadPoolExecutor(max_workers=batch_size) as executor:
            futures = {executor.submit(fetch_page, p): p for p in pages}
            for future in as_completed(futures):
                page, page_results = future.result()
                if page_results:
                    results_by_page[page] = page_results

        results = []
        for page in sorted(results_by_page.keys()):
            for item in results_by_page[page]:
                results.append(self.normalize(item))

        last_page = start_page + batch_size - 1
        has_more = last_page in results_by_page

        return results, has_more


def get_price_from_listing_url(url):
    """Fetcht den aktuellen Preis einer Kleinanzeigen-Detailseite."""
    try:
        scraper = KleinanzeigenScraper()
        
        # Check if URL is from Kleinanzeigen
        if "kleinanzeigen.de" not in url:
            return None
            
        html = scraper.fetch_url(url)
        if not html:
            # fetch_url returns None on generic errors - check for 404
            # Use fetch_url's proxy/header rotation for consistency
            return None
            
        soup = BeautifulSoup(html, "lxml")
        
        # Check if page is "nicht mehr verfügbar" (deleted)
        deleted_msg = soup.select_one(".text-body-error, .alert-warning, .boxedarticle--expired")
        if deleted_msg:
            return False
            
        price_tag = soup.select_one("#viewad-price")
        if not price_tag:
            price_tag = soup.select_one("[data-testid='price-amount']")
        if not price_tag:
            price_tag = soup.select_one(".boxedarticle--price")
        if not price_tag:
            return None
        price_text = price_tag.get_text(strip=True)
        price = PriceParser.parse(price_text)
        return price if price and price > 1 else None
    except Exception as e:
        print(f"[kleinanzeigen] Error fetching listing price from {url}: {e}")
        return None


# Backward-Compat für price_monitor.py
_scraper_instance = KleinanzeigenScraper()

def get_kleinanzeigen_results(query, location="", radius=50, start_page=1, batch_size=3, category=None, category_id=None):
    return _scraper_instance.search(query, location, radius, start_page, batch_size, category, category_id)
