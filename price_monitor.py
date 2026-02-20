import time
import json
import uuid
import os
import requests
from datetime import datetime
from sites.kleinanzeigen import get_price_from_listing_url, get_kleinanzeigen_results
from notifications import send_whatsapp, send_telegram

class PriceMonitor:
    def __init__(self):
        # Auf fly.io: /data ist persistent, lokal: aktuelles Verzeichnis
        data_dir = '/data' if os.path.isdir('/data') else '.'
        self.alerts_file = os.path.join(data_dir, 'price_alerts.json')
        self.alerts = self.load_alerts()
    
    def load_alerts(self):
        """Load alerts from file"""
        try:
            with open(self.alerts_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return []
    
    def save_alerts(self):
        """Save alerts to file"""
        with open(self.alerts_file, 'w') as f:
            json.dump(self.alerts, f, indent=2)
    
    def add_alert(self, alert_data):
        """Add a new price alert"""
        alert = {
            'id': str(uuid.uuid4()),
            'url': alert_data['url'],
            'title': alert_data['title'],
            'current_price': alert_data['current_price'],
            'alert_price': alert_data['alert_price'],
            'notification_method': alert_data['notification_method'],
            'contact_info': alert_data['contact_info'],
            'created_at': datetime.now().isoformat(),
            'last_checked': None,
            'triggered': False
        }
        self.alerts.append(alert)
        self.save_alerts()
        return alert['id']
    
    def remove_alert(self, alert_id):
        """Remove an alert"""
        self.alerts = [a for a in self.alerts if a['id'] != alert_id]
        self.save_alerts()
    
    def check_price(self, url):
        """Check current price for a Kleinanzeigen listing URL."""
        if "kleinanzeigen.de" in url:
            return get_price_from_listing_url(url)
        return None

    def check_all_alerts(self):
        """Check all alerts and send notifications if price dropped."""
        ids_to_remove = []

        for alert in self.alerts:
            try:
                current_price = self.check_price(alert['url'])
                alert['last_checked'] = datetime.now().isoformat()

                if current_price is False:
                    # Anzeige wurde auf Kleinanzeigen gelöscht → benachrichtigen + Alert entfernen
                    print(f"[monitor] Anzeige gelöscht: {alert['title']}")
                    message = (
                        f"🗑️ Anzeige wurde gelöscht!\n\n"
                        f"Produkt: {alert['title']}\n"
                        f"Dein Alert-Preis war: {alert['alert_price']:.2f}€\n\n"
                        f"Der Preis-Alert wurde automatisch entfernt."
                    )
                    if alert['notification_method'] == 'whatsapp':
                        send_whatsapp(alert['contact_info'], message)
                    elif alert['notification_method'] == 'telegram':
                        send_telegram(alert['contact_info'], message)
                    ids_to_remove.append(alert['id'])
                    continue

                if current_price is None:
                    # Temporärer Fehler (Netzwerk etc.) → einfach überspringen, nächstes Mal erneut versuchen
                    print(f"[monitor] Preis konnte nicht abgerufen werden: {alert['title']}")
                    continue

                print(f"[monitor] {alert['title']}: current={current_price}€, alert={alert['alert_price']}€")

                if current_price <= alert['alert_price']:
                    # Cooldown: max. eine Benachrichtigung alle 24h damit kein Spam
                    last_notified = alert.get('last_notified')
                    if last_notified:
                        hours_since = (datetime.now() - datetime.fromisoformat(last_notified)).total_seconds() / 3600
                        if hours_since < 24:
                            print(f"[monitor] Cooldown aktiv für '{alert['title']}' (vor {hours_since:.1f}h benachrichtigt)")
                            continue

                    message = (
                        f"🎉 Preis-Alert!\n\n"
                        f"Produkt: {alert['title']}\n"
                        f"Aktueller Preis: {current_price:.2f}€\n"
                        f"Dein Alert-Preis: {alert['alert_price']:.2f}€\n"
                        f"Link: {alert['url']}"
                    )

                    if alert['notification_method'] == 'whatsapp':
                        send_whatsapp(alert['contact_info'], message)
                    elif alert['notification_method'] == 'telegram':
                        send_telegram(alert['contact_info'], message)

                    alert['triggered'] = True
                    alert['triggered_at'] = datetime.now().isoformat()
                    alert['triggered_price'] = current_price
                    alert['last_notified'] = datetime.now().isoformat()

            except Exception as e:
                print(f"Error checking alert {alert['id']}: {e}")

        # Alerts für gelöschte Anzeigen entfernen
        if ids_to_remove:
            self.alerts = [a for a in self.alerts if a['id'] not in ids_to_remove]

        self.save_alerts()
    
    def run_monitor(self, interval_minutes=30):
        """Run monitoring loop"""
        print(f"Starting price monitor (checking every {interval_minutes} minutes)...")
        while True:
            try:
                self.check_all_alerts()
                time.sleep(interval_minutes * 60)
            except KeyboardInterrupt:
                print("Stopping price monitor...")
                break
            except Exception as e:
                print(f"Error in monitor loop: {e}")
                time.sleep(60)


class SearchAlertMonitor:
    def __init__(self):
        data_dir = '/data' if os.path.isdir('/data') else '.'
        self.alerts_file = os.path.join(data_dir, 'search_alerts.json')
        self.alerts = self.load_alerts()

    def load_alerts(self):
        try:
            with open(self.alerts_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return []

    def save_alerts(self):
        with open(self.alerts_file, 'w') as f:
            json.dump(self.alerts, f, indent=2)

    def add_alert(self, data):
        alert = {
            'id': str(uuid.uuid4()),
            'query': data['query'],
            'max_price': data['max_price'],
            'contact_info': data['contact_info'],
            'seen_urls': [],
            'created_at': datetime.now().isoformat(),
            'last_checked': None,
        }
        self.alerts.append(alert)
        self.save_alerts()
        return alert['id']

    def remove_alert(self, alert_id):
        self.alerts = [a for a in self.alerts if a['id'] != alert_id]
        self.save_alerts()

    def check_all_alerts(self):
        for alert in self.alerts:
            try:
                print(f"[suchalarm] Suche nach: {alert['query']} unter {alert['max_price']}€")
                results = get_kleinanzeigen_results(alert['query'])
                alert['last_checked'] = datetime.now().isoformat()

                new_listings = [
                    r for r in results
                    if r['price'] <= alert['max_price'] and r['url'] not in alert['seen_urls']
                ]

                for listing in new_listings:
                    message = (
                        f"🔍 Neue Anzeige gefunden!\n\n"
                        f"Suche: {alert['query']}\n"
                        f"Produkt: {listing['title']}\n"
                        f"Preis: {listing['price']:.2f}€\n"
                        f"(Dein Limit: {alert['max_price']:.2f}€)\n"
                        f"Link: {listing['url']}"
                    )
                    send_telegram(alert['contact_info'], message)
                    print(f"[suchalarm] Neue Anzeige gemeldet: {listing['title']} - {listing['price']}€")
                    alert['seen_urls'].append(listing['url'])

                self.save_alerts()
            except Exception as e:
                print(f"[suchalarm] Fehler bei {alert['query']}: {e}")
