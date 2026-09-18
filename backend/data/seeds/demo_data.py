"""
TerraPulse Demo Data Seeder
============================
Standalone script for quick local setup.

Usage:
    cd backend
    ./venv/bin/python data/seeds/demo_data.py

This registers a demo user (if not exists) and seeds
projects, sites, and 12 months of analytics history.
"""

import sys
import os

# Ensure the backend app is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from sqlalchemy import text

from app.config import settings
from app.database.base import Base
from app.database.connection import SessionLocal, engine
from app.models import ActivityLog, Analytics, Project, Site, User  # noqa: F401
from app.models.user import User as UserModel
from app.auth.hashing import hash_password
from app.services.seed_service import seed_demo_data


DEMO_EMAIL = "demo@terrapulse.io"
DEMO_PASSWORD = "demo1234"
DEMO_NAME = "Demo User"


def main():
    print("=" * 50)
    print("  TerraPulse Demo Data Seeder")
    print("=" * 50)
    print()

    # Ensure PostGIS + tables exist
    print("[1/4] Ensuring PostGIS extension...")
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        conn.commit()
    print("  ✓ PostGIS enabled")

    print("[2/4] Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("  ✓ All tables ready")

    db = SessionLocal()
    try:
        # Create or find demo user
        print(f"[3/4] Setting up demo user ({DEMO_EMAIL})...")
        user = db.query(UserModel).filter(UserModel.email == DEMO_EMAIL).first()

        if not user:
            user = UserModel(
                name=DEMO_NAME,
                email=DEMO_EMAIL,
                password_hash=hash_password(DEMO_PASSWORD),
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"  ✓ Created user: {DEMO_EMAIL} / {DEMO_PASSWORD}")
        else:
            print(f"  ✓ User already exists: {DEMO_EMAIL}")

        # Seed demo data
        print("[4/4] Seeding demo data...")
        result = seed_demo_data(db, owner_id=user.id)
        print(f"  ✓ Projects created: {result['projects_created']}")
        print(f"  ✓ Sites created:    {result['sites_created']}")
        print(f"  ✓ Analytics records: {result['analytics_records_created']}")

        print()
        print("=" * 50)
        print("  Seeding complete!")
        print()
        print(f"  Login credentials:")
        print(f"    Email:    {DEMO_EMAIL}")
        print(f"    Password: {DEMO_PASSWORD}")
        print()
        print("  Start the server:")
        print("    ./venv/bin/python -m uvicorn app.main:app --reload --port 8000")
        print("=" * 50)

    finally:
        db.close()


if __name__ == "__main__":
    main()
