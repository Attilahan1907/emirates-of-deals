import random
import time

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

    def normalize(self, item):
        """Fügt 'source' Feld hinzu — in Unterklassen aufrufen."""
        item["source"] = self.SOURCE
        return item

    def search(self, query, location="", radius=50, start_page=1, batch_size=3, category=None, category_id=None):
        """Muss von jeder Unterklasse implementiert werden. Gibt (results, has_more) zurück."""
        raise NotImplementedError(f"{self.__class__.__name__} muss search() implementieren")
