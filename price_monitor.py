import time
import uuid
from datetime import datetime
from database import SessionLocal, PriceAlert, SearchAlert, PushSubscription
from sites.kleinanzeigen import get_price_from_listing_url, get_kleinanzeigen_results
from notifications import send_whatsapp, send_telegram, send_browser_push
from sites.price_history import PriceHistory

class PriceMonitor:
    def __init__(self):
        self.price_history = PriceHistory()

    def _notify(self, alert, message, db):
        """Helper to send notifications via selected method."""
        if alert.notification_method == 'telegram':
            send_telegram(alert.contact_info, message)
        elif alert.notification_method == 'push':
            # Send to all active subscriptions
            subs = db.query(PushSubscription).all()
            for sub in subs:
                send_browser_push(sub.subscription_data, message)
        elif alert.notification_method == 'whatsapp':
            send_whatsapp(alert.contact_info, message)
    
    def add_alert(self, alert_data):
        """Add a new price alert to DB"""
        db = SessionLocal()
        try:
            alert_id = str(uuid.uuid4())
            alert = PriceAlert(
                id=alert_id,
                url=alert_data['url'],
                title=alert_data['title'],
                current_price=alert_data['current_price'],
                alert_price=alert_data['alert_price'],
                notification_method=alert_data['notification_method'],
                contact_info=alert_data['contact_info']
            )
            db.add(alert)
            db.commit()
            return alert_id
        finally:
            db.close()
    
    def remove_alert(self, alert_id):
        """Remove an alert from DB"""
        db = SessionLocal()
        try:
            alert = db.query(PriceAlert).filter(PriceAlert.id == alert_id).first()
            if alert:
                db.delete(alert)
                db.commit()
        finally:
            db.close()

    def get_all_alerts(self):
        db = SessionLocal()
        try:
            alerts = db.query(PriceAlert).all()
            return [{
                'id': a.id, 'url': a.url, 'title': a.title, 'current_price': a.current_price,
                'alert_price': a.alert_price, 'notification_method': a.notification_method,
                'contact_info': a.contact_info, 'triggered': a.triggered
            } for a in alerts]
        finally:
            db.close()

    def check_price(self, url):
        if "kleinanzeigen.de" in url:
            return get_price_from_listing_url(url)
        return None

    def check_all_alerts(self):
        """Check all alerts in DB and notify if price dropped."""
        db = SessionLocal()
        try:
            alerts = db.query(PriceAlert).all()
            for alert in alerts:
                try:
                    current_price = self.check_price(alert.url)
                    alert.last_checked = datetime.utcnow()

                    if current_price is not False and current_price is not None:
                        self.price_history.record_price(alert.url, current_price)

                    if current_price is False:
                        # Deleted on Kleinanzeigen
                        message = f"🗑️ Anzeige wurde gelöscht!\n\nProdukt: {alert.title}\nAlert-Preis: {alert.alert_price:.2f}€"
                        self._notify(alert, message, db)
                        db.delete(alert)
                        continue

                    if current_price is None:
                        continue

                    print(f"[monitor] {alert.title}: {current_price}€ (target: {alert.alert_price}€)")

                    if current_price <= alert.alert_price:
                        # 24h Cooldown
                        if alert.last_notified:
                            hours_since = (datetime.utcnow() - alert.last_notified).total_seconds() / 3600
                            if hours_since < 24:
                                continue

                        message = (f"🎉 Preis-Alert!\n\nProdukt: {alert.title}\n"
                                  f"Aktueller Preis: {current_price:.2f}€\n"
                                  f"Dein Limit: {alert.alert_price:.2f}€\nLink: {alert.url}")

                        self._notify(alert, message, db)

                        alert.triggered = True
                        alert.triggered_at = datetime.utcnow()
                        alert.triggered_price = current_price
                        alert.last_notified = datetime.utcnow()

                except Exception as e:
                    print(f"Error checking alert {alert.id}: {e}")
            
            db.commit()
        finally:
            db.close()
    
    def run_monitor(self, interval_minutes=30):
        while True:
            try:
                self.check_all_alerts()
                time.sleep(interval_minutes * 60)
            except Exception as e:
                print(f"Monitor loop error: {e}")
                time.sleep(60)

class SearchAlertMonitor:
    def add_alert(self, data):
        db = SessionLocal()
        try:
            alert_id = str(uuid.uuid4())
            alert = SearchAlert(
                id=alert_id,
                query=data['query'],
                max_price=data['max_price'],
                contact_info=data['contact_info']
            )
            db.add(alert)
            db.commit()
            return alert_id
        finally:
            db.close()

    def remove_alert(self, alert_id):
        db = SessionLocal()
        try:
            alert = db.query(SearchAlert).filter(SearchAlert.id == alert_id).first()
            if alert:
                db.delete(alert)
                db.commit()
        finally:
            db.close()

    def get_all_alerts(self):
        db = SessionLocal()
        try:
            alerts = db.query(SearchAlert).all()
            return [{
                'id': a.id, 'query': a.query, 'max_price': a.max_price, 'contact_info': a.contact_info
            } for a in alerts]
        finally:
            db.close()

    def check_all_alerts(self):
        db = SessionLocal()
        try:
            alerts = db.query(SearchAlert).all()
            for alert in alerts:
                try:
                    results = get_kleinanzeigen_results(alert.query)
                    alert.last_checked = datetime.utcnow()

                    new_listings = [
                        r for r in results
                        if r['price'] <= alert.max_price and r['url'] not in (alert.seen_urls or [])
                    ]

                    for listing in new_listings:
                        message = (f"🔍 Neue Anzeige!\n\nSuche: {alert.query}\n"
                                  f"Produkt: {listing['title']}\nPreis: {listing['price']:.2f}€\nLink: {listing['url']}")
                        
                        # Search alerts default to telegram for now
                        send_telegram(alert.contact_info, message)
                        
                        # Update seen_urls
                        current_seen = list(alert.seen_urls or [])
                        current_seen.append(listing['url'])
                        alert.seen_urls = current_seen

                except Exception as e:
                    print(f"[suchalarm] Fehler: {e}")
            db.commit()
        finally:
            db.close()
