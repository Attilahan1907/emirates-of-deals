# BargainBot - Memory (Technische Referenz)

## Aktuelles Ergebnis-Format (Kleinanzeigen)
```json
{
  "source": "kleinanzeigen",
  "title": "string",
  "url": "string",
  "price": 0.0,
  "image": "string | null",
  "original": "string"
}
```
Nach Umbau kommt `"source"` Feld dazu — Frontend muss das anzeigen.

## Provider-Modell Architektur
```
BaseScraper (abstrakt)
  ├── search(query, location, radius, start_page, batch_size) → (results, has_more)
  ├── normalize(raw_item) → dict
  └── _get_headers() → rotierte Headers + random delay

KleinanzeigenScraper(BaseScraper) → sites/kleinanzeigen.py
EbayScraper(BaseScraper)          → sites/ebay.py
AmazonScraper(BaseScraper)        → sites/amazon.py
```

## Provider Registry (main.py)
```python
PROVIDERS = {
    "kleinanzeigen": KleinanzeigenScraper(),
    "ebay": EbayScraper(),
    "amazon": AmazonScraper(),
}
```
Default sources: `["kleinanzeigen"]` — rückwärtskompatibel.

## Cache-Key Format (main.py)
```
"{query}|{location}|{radius}|{category}|{category_id}|{start_page}|{batch_size}|{sources}"
```
`sources` muss zum Cache-Key, damit eBay+Kleinanzeigen nicht mit nur-Kleinanzeigen vermischt wird.

## Bekannte Probleme / Entscheidungen
- Amazon PA-API bevorzugt (Scraping sehr instabil durch Bot-Schutz)
- eBay: API-First (Finding API kostenlos), Scraping als Fallback
- Header-Rotation + `time.sleep(random.uniform(0.5, 1.5))` in BaseScraper einbauen
- `.env` enthält API-Keys — niemals committen
- `search_alerts.json` und `price_alerts.json` — niemals committen

## API-Strukturen (geplant)
### eBay Finding API
- Endpoint: `https://svcs.ebay.com/services/search/FindingService/v1`
- Auth: App-ID (kostenlos registrierbar)
- Response: XML oder JSON

### Amazon PA-API 4.0
- Endpoint: `webservices.amazon.de`
- Auth: Access Key + Secret Key + Partner Tag (Amazon Affiliate nötig)
- SDK: `paapi5-python-sdk`
