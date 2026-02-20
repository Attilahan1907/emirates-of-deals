from bs4 import BeautifulSoup
import requests
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "de-DE,de;q=0.9",
}

CATEGORY_EXCLUDE = {
    "gpu": [
        "adapter", "kabel", "cable", "halterung", "bracket", "riser",
        "backplate", "netzteil", "mining rig", "gehäuse", "case",
        "suche", "tausch", "defekt", "kaputt", "ersatzteil",
        "verlängerung", "hub", "dock", "splitter", "konverter",
        "schrauben", "lüfter einzeln", "nur kühler", "nur lüfter",
        "attrappe", "dummy", "abdeckung", "blende",
    ],
    "cpu": [
        "adapter", "kabel", "halterung", "bracket", "kühler",
        "cooler", "lüfter", "suche", "tausch", "defekt", "kaputt",
        "ersatzteil", "wärmeleitpaste", "paste", "sockel adapter",
        "mainboard", "motherboard",
    ],
    "ram": [
        "adapter", "suche", "tausch", "defekt", "kaputt",
        "grafikkarte", "gpu", "mainboard", "laptop komplett",
        "pc komplett", "gehäuse",
    ],
    "smartphone": [
        "hülle", "case", "folie", "panzerglas", "ladekabel",
        "adapter", "halterung", "ständer", "dock", "suche", "tausch",
        "defekt", "kaputt", "ersatzteil", "display reparatur",
        "akku ersatz", "nur display",
    ],
}

# Words that MUST appear in the title for a category hit
CATEGORY_REQUIRE_ANY = {
    "gpu": [
        "rtx", "gtx", "geforce", "radeon", "rx ", "grafikkarte",
        "gpu", "arc a", "arc b", "nvidia", "amd",
    ],
    "cpu": [
        "ryzen", "core i", "i3", "i5", "i7", "i9", "prozessor",
        "cpu", "intel", "amd", "core ultra",
    ],
    "ram": [
        "ram", "ddr3", "ddr4", "ddr5", "arbeitsspeicher",
        "speicher", "dimm", "sodimm",
    ],
    "smartphone": [
        "iphone", "samsung", "galaxy", "pixel", "xiaomi", "redmi",
        "poco", "oneplus", "huawei", "nothing phone", "xperia",
        "smartphone", "handy",
    ],
}


def _is_relevant(title, query, category=None, has_category_id=False):
    title_lower = title.lower()

    # When a category_id is set, Kleinanzeigen already filters by category.
    # Skip the query keyword check — the user just browses the category.
    if query and not has_category_id:
        keywords = [w for w in query.lower().split() if len(w) >= 3]
        if not all(kw in title_lower for kw in keywords):
            return False

    if category and category in CATEGORY_EXCLUDE:
        if any(ex in title_lower for ex in CATEGORY_EXCLUDE[category]):
            return False

    if category and category in CATEGORY_REQUIRE_ANY:
        if not any(req in title_lower for req in CATEGORY_REQUIRE_ANY[category]):
            return False

    return True

def _parse_page(soup, query, category=None, has_category_id=False):
    results = []
    for item in soup.select("article.aditem"):
        title_tag = item.select_one(".text-module-begin a")
        price_tag = item.select_one(".aditem-main--middle--price-shipping--price")

        if not (title_tag and price_tag):
            continue

        title = title_tag.text.strip()
        if not _is_relevant(title, query, category, has_category_id):
            continue

        href = title_tag.get("href", "")
        link = "https://www.kleinanzeigen.de" + href if href.startswith("/") else href
        price_text = price_tag.text.strip()

        lower = price_text.lower()
        if any(x in lower for x in ["vb", "zu verschenken", "anfrage"]):
            continue

        # Bild-URL extrahieren (data-src für lazy-loaded Bilder)
        img_tag = item.select_one(".imagebox img")
        image_url = None
        if img_tag:
            image_url = img_tag.get("data-src") or img_tag.get("src")

        try:
            # German number format: 1.250,00 € -> 1250.00
            price_clean = price_text.replace("€", "").replace(".", "").replace(",", ".").strip()
            price = float(re.findall(r"\d+\.?\d*", price_clean)[0])
            if price <= 1:
                continue
            results.append({
                "title": title,
                "url": link,
                "price": price,
                "original": f"€{price:.2f}",
                "image": image_url,
            })
        except Exception:
            continue
    return results

def get_price_from_listing_url(url):
    """
    Fetches a single Kleinanzeigen listing page and extracts the current price.
    Returns the price as float, or None if not found / listing deleted.
    """
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 404:
            return False  # Anzeige definitiv gelöscht
        soup = BeautifulSoup(response.text, "lxml")

        # Primary selector used on Kleinanzeigen detail pages
        price_tag = soup.select_one("#viewad-price")
        if not price_tag:
            # Fallback selectors
            price_tag = soup.select_one("[data-testid='price-amount']")
        if not price_tag:
            price_tag = soup.select_one(".boxedarticle--price")

        if not price_tag:
            return None

        price_text = price_tag.get_text(strip=True)
        lower = price_text.lower()

        if any(x in lower for x in ["vb", "zu verschenken", "anfrage", "gesuch"]):
            return None

        price_clean = price_text.replace("€", "").replace(".", "").replace(",", ".").strip()
        matches = re.findall(r"\d+\.?\d*", price_clean)
        if not matches:
            return None

        price = float(matches[0])
        return price if price > 1 else None

    except Exception as e:
        print(f"[kleinanzeigen] Error fetching listing price from {url}: {e}")
        return None


def get_kleinanzeigen_results(query, location="", radius=50, start_page=1, batch_size=3, category=None, category_id=None):
    query_encoded = query.replace(" ", "-") if query else ""
    location_encoded = location.strip().replace(" ", "-").lower()

    k_suffix = f"k0c{category_id}" if category_id else "k0"

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
            response = requests.get(url, headers=headers, params=params, timeout=10)
            soup = BeautifulSoup(response.text, "lxml")
            return page, _parse_page(soup, query or "", category, bool(category_id))
        except Exception:
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
        results.extend(results_by_page[page])

    # Wenn die letzte Seite des Batches Ergebnisse hatte → es gibt wahrscheinlich mehr
    last_page = start_page + batch_size - 1
    has_more = last_page in results_by_page

    return results, has_more
