from datetime import datetime
from database import SessionLocal, PriceHistoryItem
from sqlalchemy import func

class PriceHistory:
    def record_price(self, url, price):
        """Records a price point for a specific URL in the database."""
        if not url or price is None:
            return

        db = SessionLocal()
        try:
            history_item = PriceHistoryItem(
                url=url,
                price=price,
                timestamp=datetime.utcnow()
            )
            db.add(history_item)
            db.commit()
        except Exception as e:
            print(f"[db] Error recording price history: {e}")
            db.rollback()
        finally:
            db.close()

    def get_history(self, url):
        """Returns the history for a specific URL from the database."""
        db = SessionLocal()
        try:
            results = db.query(PriceHistoryItem).filter(PriceHistoryItem.url == url).order_by(PriceHistoryItem.timestamp.asc()).all()
            return [{
                'timestamp': item.timestamp.isoformat(),
                'price': item.price
            } for item in results]
        finally:
            db.close()

    def get_stats(self, url):
        """Returns min, max, and avg price from history using database aggregation."""
        db = SessionLocal()
        try:
            stats = db.query(
                func.min(PriceHistoryItem.price),
                func.max(PriceHistoryItem.price),
                func.avg(PriceHistoryItem.price),
                func.count(PriceHistoryItem.id)
            ).filter(PriceHistoryItem.url == url).first()
            
            if not stats or stats[3] == 0:
                return None
                
            return {
                'min': float(stats[0]),
                'max': float(stats[1]),
                'avg': float(stats[2]),
                'count': int(stats[3])
            }
        finally:
            db.close()
