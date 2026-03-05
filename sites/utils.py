import re

CATEGORY_EXCLUDE = {
    "gpu": [
        "adapter", "kabel", "cable", "halterung", "bracket", "riser",
        "backplate", "netzteil", "mining rig", "gehäuse", "case",
        "suche", "tausch", "defekt", "kaputt", "ersatzteil",
        "verlängerung", "hub", "dock", "splitter", "konverter",
        "schrauben", "lüfter einzeln", "nur kühler", "nur lüfter",
        "attrappe", "dummy", "abdeckung", "blende", "postkarte", "ansichtskarte",
        "werbekarte", "prospekt", "karton", "ovp nur", "verpackung nur"
    ],
    "cpu": [
        "adapter", "kabel", "halterung", "bracket", "kühler",
        "cooler", "lüfter", "suche", "tausch", "defekt", "kaputt",
        "ersatzteil", "wärmeleitpaste", "paste", "sockel adapter",
        "mainboard", "motherboard", "postkarte", "ansichtskarte"
    ],
    "ram": [
        "adapter", "suche", "tausch", "defekt", "kaputt",
        "grafikkarte", "gpu", "mainboard", "laptop komplett",
        "pc komplett", "gehäuse", "postkarte", "ansichtskarte"
    ],
    "smartphone": [
        "hülle", "case", "folie", "panzerglas", "ladekabel",
        "adapter", "halterung", "ständer", "dock", "suche", "tausch",
        "defekt", "kaputt", "ersatzteil", "display reparatur",
        "akku ersatz", "nur display", "postkarte", "ansichtskarte"
    ],
}

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

def is_relevant(title, query, category=None, has_category_id=False):
    """
    Checks if a result is relevant based on title, query and category.
    Now shared between Kleinanzeigen and eBay to ensure consistency.
    """
    title_lower = title.lower()
    
    # 1. Broad exclusion for all tech categories
    if category in ["gpu", "cpu", "ram", "smartphone"]:
        # Match "ak ", "ak,", "ak." at the start or anywhere
        if re.search(r'\bak[\s,.]', title_lower) or any(x in title_lower for x in ["postkarte", "ansichtskarte", "werbekarte", "prospekt", "magazin"]):
            return False

    # 2. Query based filtering (mandatory if no category_id was used to search)
    if query and not has_category_id:
        keywords = [w for w in query.lower().split() if len(w) >= 3]
        if not all(kw in title_lower for kw in keywords):
            return False
            
    # 3. Category specific exclusions
    if category and category in CATEGORY_EXCLUDE:
        if any(ex in title_lower for ex in CATEGORY_EXCLUDE[category]):
            return False
            
    # 4. Category specific requirements (ensures "Grafikkarte" search doesn't return cables)
    if category and category in CATEGORY_REQUIRE_ANY:
        if not any(req in title_lower for req in CATEGORY_REQUIRE_ANY[category]):
            return False
            
    return True

class PriceParser:
    """Robust price parsing for various formats found on classified sites."""
    
    EXCLUDE_KEYWORDS = ["vb", "zu verschenken", "anfrage", "gesuch", "suche", "tausch"]

    @staticmethod
    def clean_text(text):
        if not text:
            return ""
        return text.strip().lower()

    @staticmethod
    def is_valid_listing(text):
        """Checks if the price text indicates a valid sale (not a request or giveaway)."""
        lower_text = PriceParser.clean_text(text)
        if not lower_text:
            return False
        return not any(keyword in lower_text for keyword in PriceParser.EXCLUDE_KEYWORDS)

    @staticmethod
    def parse(text):
        """
        Parses a price string into a float.
        Correctly handles German (1.234,56) and International (1,234.56) formats.
        """
        if not PriceParser.is_valid_listing(text):
            return None
            
        # 1. Clean string: keep only digits, dots and commas
        clean_text = re.sub(r"[^\d.,]", "", text)
        if not clean_text:
            return None
            
        dot_idx = clean_text.rfind('.')
        comma_idx = clean_text.rfind(',')
        
        # 2. Both separators present: "1.234,56" or "1,234.56"
        if dot_idx != -1 and comma_idx != -1:
            if dot_idx < comma_idx: # German style
                final_text = clean_text.replace(".", "").replace(",", ".")
            else: # US style
                final_text = clean_text.replace(",", "")
        
        # 3. Only comma present: "3,50"
        elif comma_idx != -1:
            final_text = clean_text.replace(",", ".")
            
        # 4. Only dot present: "3.000" or "3.50"
        elif dot_idx != -1:
            after_dot = clean_text[dot_idx + 1:]
            if len(after_dot) == 3:
                final_text = clean_text.replace(".", "") # "3.000" -> "3000"
            else:
                final_text = clean_text # "3.50" -> "3.50" (decimal)
        
        else:
            final_text = clean_text
            
        try:
            price = float(final_text)
            return price if price > 0 else None
        except ValueError:
            return None

class ScraperLogger:
    """Robust health monitoring for scrapers with batched database persistence."""
    
    _log_queue = []
    _queue_lock = None
    
    @staticmethod
    def _get_lock():
        if ScraperLogger._queue_lock is None:
            import threading
            ScraperLogger._queue_lock = threading.Lock()
        return ScraperLogger._queue_lock

    @staticmethod
    def _flush_logs():
        if not ScraperLogger._log_queue:
            return
            
        from database import SessionLocal, ScraperLog
        db = SessionLocal()
        try:
            logs_to_insert = ScraperLogger._log_queue[:]
            ScraperLogger._log_queue.clear()
            
            for log_data in logs_to_insert:
                log = ScraperLog(**log_data)
                db.add(log)
            db.commit()
        except Exception as e:
            print(f"Failed to flush scraper logs: {e}")
            # Re-queue failed logs (up to 10 to avoid infinite growth)
            with ScraperLogger._get_lock():
                if len(ScraperLogger._log_queue) < 10:
                    ScraperLogger._log_queue.extend(logs_to_insert)
        finally:
            db.close()

    @staticmethod
    def _queue_log(source, status, page=1, items_found=0, error_message=None):
        import atexit
        from database import SessionLocal, ScraperLog
        
        # Ensure lock exists
        ScraperLogger._get_lock()
        
        # Register cleanup on first use
        if not hasattr(ScraperLogger, '_cleanup_registered'):
            atexit.register(ScraperLogger._flush_logs)
            ScraperLogger._cleanup_registered = True
        
        log_data = {
            'source': source,
            'status': status,
            'page': page,
            'items_found': items_found,
            'error_message': str(error_message) if error_message else None
        }
        
        with ScraperLogger._get_lock():
            ScraperLogger._log_queue.append(log_data)
            # Flush when queue reaches 10 entries
            if len(ScraperLogger._log_queue) >= 10:
                ScraperLogger._flush_logs()

    @staticmethod
    def log_success(source, page, count):
        print(f"[{source}] SUCCESS: Page {page} found {count} items.")
        ScraperLogger._queue_log(source, "success", page, count)

    @staticmethod
    def log_error(source, page, error):
        print(f"[{source}] ERROR: Page {page} failed: {error}")
        ScraperLogger._queue_log(source, "error", page, error_message=error)

    @staticmethod
    def log_rate_limit(source, page):
        print(f"[{source}] WARNING: Rate-limit (429) on Page {page}")
        ScraperLogger._queue_log(source, "rate_limit", page)
