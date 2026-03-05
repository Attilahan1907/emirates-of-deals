import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# Database URL from Environment or local SQLite fallback
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./emirates_deals.db")

# Fix for Heroku/Fly.io providing 'postgres://' instead of 'postgresql://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite specific config (not needed for Postgres)
engine_args = {}
if DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class PriceAlert(Base):
    __tablename__ = "price_alerts"

    id = Column(String, primary_key=True, index=True)
    url = Column(String, index=True)
    title = Column(String)
    current_price = Column(Float)
    alert_price = Column(Float)
    notification_method = Column(String) # 'telegram', 'whatsapp', 'push'
    contact_info = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_checked = Column(DateTime, nullable=True)
    last_notified = Column(DateTime, nullable=True)
    triggered = Column(Boolean, default=False)
    triggered_at = Column(DateTime, nullable=True)
    triggered_price = Column(Float, nullable=True)

class SearchAlert(Base):
    __tablename__ = "search_alerts"

    id = Column(String, primary_key=True, index=True)
    query = Column(String)
    max_price = Column(Float)
    contact_info = Column(String)
    seen_urls = Column(JSON, default=list) # Stored as JSON list
    created_at = Column(DateTime, default=datetime.utcnow)
    last_checked = Column(DateTime, nullable=True)

class PriceHistoryItem(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    price = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class PushSubscription(Base):
    __tablename__ = "push_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    subscription_data = Column(JSON) # Stores the browser push object
    created_at = Column(DateTime, default=datetime.utcnow)

class ScraperLog(Base):
    __tablename__ = "scraper_logs"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, index=True) # 'ebay', 'kleinanzeigen'
    status = Column(String) # 'success', 'error', 'rate_limit'
    page = Column(Integer)
    items_found = Column(Integer, default=0)
    error_message = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create tables
def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
