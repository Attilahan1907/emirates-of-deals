import json
import os
import uuid
from datetime import datetime
from database import SessionLocal, init_db, PriceAlert, SearchAlert, PriceHistoryItem, PushSubscription

def migrate():
    print("Starting migration from JSON to Database...")
    init_db()
    db = SessionLocal()
    
    data_dir = '/data' if os.path.isdir('/data') else '.'
    
    # 1. Migrate Price Alerts
    price_alerts_file = os.path.join(data_dir, 'price_alerts.json')
    if os.path.exists(price_alerts_file):
        try:
            with open(price_alerts_file, 'r') as f:
                data = json.load(f)
                for item in data:
                    # Check if already exists
                    if not db.query(PriceAlert).filter(PriceAlert.id == item['id']).first():
                        alert = PriceAlert(
                            id=item['id'],
                            url=item['url'],
                            title=item['title'],
                            current_price=item['current_price'],
                            alert_price=item['alert_price'],
                            notification_method=item['notification_method'],
                            contact_info=item['contact_info'],
                            created_at=datetime.fromisoformat(item['created_at']) if item.get('created_at') else datetime.utcnow(),
                            last_checked=datetime.fromisoformat(item['last_checked']) if item.get('last_checked') else None,
                            last_notified=datetime.fromisoformat(item['last_notified']) if item.get('last_notified') else None,
                            triggered=item.get('triggered', False),
                            triggered_at=datetime.fromisoformat(item['triggered_at']) if item.get('triggered_at') else None,
                            triggered_price=item.get('triggered_price')
                        )
                        db.add(alert)
            print(f"Migrated Price Alerts.")
        except Exception as e:
            print(f"Error migrating Price Alerts: {e}")

    # 2. Migrate Search Alerts
    search_alerts_file = os.path.join(data_dir, 'search_alerts.json')
    if os.path.exists(search_alerts_file):
        try:
            with open(search_alerts_file, 'r') as f:
                data = json.load(f)
                for item in data:
                    if not db.query(SearchAlert).filter(SearchAlert.id == item['id']).first():
                        alert = SearchAlert(
                            id=item['id'],
                            query=item['query'],
                            max_price=item['max_price'],
                            contact_info=item['contact_info'],
                            seen_urls=item.get('seen_urls', []),
                            created_at=datetime.fromisoformat(item['created_at']) if item.get('created_at') else datetime.utcnow(),
                            last_checked=datetime.fromisoformat(item['last_checked']) if item.get('last_checked') else None
                        )
                        db.add(alert)
            print(f"Migrated Search Alerts.")
        except Exception as e:
            print(f"Error migrating Search Alerts: {e}")

    # 3. Migrate Price History
    price_history_file = os.path.join(data_dir, 'price_history.json')
    if os.path.exists(price_history_file):
        try:
            with open(price_history_file, 'r') as f:
                data = json.load(f)
                for url, points in data.items():
                    for pt in points:
                        history_item = PriceHistoryItem(
                            url=url,
                            price=pt['price'],
                            timestamp=datetime.fromisoformat(pt['timestamp']) if pt.get('timestamp') else datetime.utcnow()
                        )
                        db.add(history_item)
            print(f"Migrated Price History.")
        except Exception as e:
            print(f"Error migrating Price History: {e}")

    # 4. Migrate Push Subscriptions
    push_subs_file = os.path.join(data_dir, 'push_subscriptions.json')
    if os.path.exists(push_subs_file):
        try:
            with open(push_subs_file, 'r') as f:
                data = json.load(f)
                for sub in data:
                    # In DB we store them as they are
                    push_sub = PushSubscription(subscription_data=sub)
                    db.add(push_sub)
            print(f"Migrated Push Subscriptions.")
        except Exception as e:
            print(f"Error migrating Push Subscriptions: {e}")

    db.commit()
    db.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
