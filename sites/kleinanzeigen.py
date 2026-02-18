from bs4 import BeautifulSoup
import requests
import re

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "de-DE,de;q=0.9",
}

def _is_relevant(title, query):
    # All query keywords with 3+ characters must appear in the title
    keywords = [w for w in query.lower().split() if len(w) >= 3]
    title_lower = title.lower()
    return all(kw in title_lower for kw in keywords)

def _parse_page(soup, query):
    results = []
    for item in soup.select("article.aditem"):
        title_tag = item.select_one(".text-module-begin a")
        price_tag = item.select_one(".aditem-main--middle--price-shipping--price")

        if not (title_tag and price_tag):
            continue

        title = title_tag.text.strip()
        if not _is_relevant(title, query):
            continue

        href = title_tag.get("href", "")
        link = "https://www.kleinanzeigen.de" + href if href.startswith("/") else href
        price_text = price_tag.text.strip()

        lower = price_text.lower()
        if any(x in lower for x in ["vb", "zu verschenken", "anfrage"]):
            continue

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
                "original": f"€{price:.2f}"
            })
        except Exception:
            continue
    return results

def get_kleinanzeigen_results(query, location="", radius=50, max_pages=5):
    query_encoded = query.replace(" ", "-")
    location_encoded = location.strip().replace(" ", "-").lower()
    results = []

    params = {}
    if location_encoded and radius != 0:
        params["locationStr"] = location.strip()
        params["radius"] = radius

    for page in range(1, max_pages + 1):
        if page == 1:
            url = f"https://www.kleinanzeigen.de/s-{query_encoded}/k0"
        else:
            url = f"https://www.kleinanzeigen.de/s-seite:{page}/{query_encoded}/k0"

        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            soup = BeautifulSoup(response.text, "lxml")
        except Exception:
            break

        page_results = _parse_page(soup, query)
        if not page_results:
            break

        results.extend(page_results)

    return results
