import random
import time
import requests
import os

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
]

# Passende Accept-Language je User-Agent-Profil
_ACCEPT_LANGUAGES = [
    "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
    "de-DE,de;q=0.9,en;q=0.8",
    "de-AT,de;q=0.9,en-US;q=0.8,en;q=0.7",
    "de-CH,de;q=0.9,en;q=0.8",
]

class BaseScraper:
    SOURCE = "unknown"

    def __init__(self):
        self.proxies = self._load_proxies()

    def _load_proxies(self):
        """Loads proxies from PROXY_LIST environment variable (comma separated)."""
        proxy_str = os.getenv("PROXY_LIST", "")
        if not proxy_str:
            return []
        return [p.strip() for p in proxy_str.split(",") if p.strip()]

    def get_headers(self):
        """Rotiert User-Agent + Headers bei jedem Aufruf für realistischere Requests."""
        ua = random.choice(USER_AGENTS)
        is_firefox = "Firefox" in ua
        headers = {
            "User-Agent": ua,
            "Accept-Language": random.choice(_ACCEPT_LANGUAGES),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0",
        }
        if is_firefox:
            headers["DNT"] = "1"
        return headers

    def random_delay(self, min_s=0.5, max_s=1.5):
        """Zufällige Pause zwischen Requests — verhindert Rate-Limiting."""
        time.sleep(random.uniform(min_s, max_s))

    def fetch_url(self, url, params=None):
        """Robust URL fetching with retries, rotating headers and optional proxies."""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Short random delay to avoid detection
                self.random_delay(0.1, 0.3)
                
                proxy_config = None
                if self.proxies:
                    p = random.choice(self.proxies)
                    proxy_config = {"http": p, "https": p}

                response = requests.get(
                    url, 
                    params=params, 
                    headers=self.get_headers(), 
                    timeout=15,
                    proxies=proxy_config
                )
                
                if response.status_code == 429:
                    print(f"[{self.SOURCE}] Rate limited (429). Retrying...")
                    time.sleep(5 * (attempt + 1))
                    continue
                    
                response.raise_for_status()
                return response.text
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"[{self.SOURCE}] Failed to fetch {url} after {max_retries} attempts: {e}")
                    raise e
                time.sleep(2)
        return None

    def normalize(self, item):
        """Fügt 'source' Feld hinzu — in Unterklassen aufrufen."""
        item["source"] = self.SOURCE
        return item

    def search(self, query, location="", radius=50, start_page=1, batch_size=3, category=None, category_id=None, **kwargs):
        """Muss von jeder Unterklasse implementiert werden. Gibt (results, has_more) zurück."""
        raise NotImplementedError(f"{self.__class__.__name__} muss search() implementieren")
