import os
import sys
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker
from database import Base, PriceAlert, SearchAlert, PriceHistoryItem, PushSubscription, ScraperLog

# Configuration
SQLITE_URL = "sqlite:///./emirates_deals.db"
# You would set this environment variable before running the script
POSTGRES_URL = os.environ.get("DATABASE_URL")

if not POSTGRES_URL or not POSTGRES_URL.startswith("postgresql"):
    print("ERROR: DATABASE_URL environment variable must be set to a valid PostgreSQL URL.")
    print("Example: set DATABASE_URL=postgresql://user:password@localhost:5432/dbname")
    sys.exit(1)

def migrate():
    print(f"Starting migration from SQLite ({SQLITE_URL}) to PostgreSQL...")

    # Engines and Sessions
    sqlite_engine = create_engine(SQLITE_URL)
    sqlite_session = sessionmaker(bind=sqlite_engine)()

    pg_engine = create_engine(POSTGRES_URL)
    Base.metadata.create_all(pg_engine)
    pg_session = sessionmaker(bind=pg_engine)()

    models = [PriceAlert, SearchAlert, PriceHistoryItem, PushSubscription, ScraperLog]

    try:
        for model in models:
            table_name = model.__tablename__
            print(f"Migrating table: {table_name}...", end=" ", flush=True)
            
            # Get all data from SQLite
            items = sqlite_session.query(model).all()
            
            if not items:
                print("Skipped (empty)")
                continue

            # Clear target table in PG (optional, use with caution)
            # pg_session.query(model).delete()

            # Add to Postgres
            # We use make_transient to avoid identity conflicts during migration
            for item in items:
                pg_session.merge(item)
            
            pg_session.commit()
            print(f"Done ({len(items)} items)")

        print("SUCCESS: Migration completed successfully.")

    except Exception as e:
        print(f"ERROR during migration: {e}")
        pg_session.rollback()
    finally:
        sqlite_session.close()
        pg_session.close()

if __name__ == "__main__":
    migrate()
