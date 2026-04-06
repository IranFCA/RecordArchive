#!/usr/bin/env python3
"""
Database migration to add investigator_notes column to submissions table.
Run this script once to add the new column to your database.
"""

import sys
from pathlib import Path

# Add the app directory to the Python path
app_dir = Path(__file__).parent / "app"
if app_dir.exists():
    sys.path.insert(0, str(app_dir))

from sqlalchemy import create_engine, text
from app.config import settings

def add_investigator_notes_column():
    """Add investigator_notes column to submissions table."""

    # Create engine with database URL
    engine = create_engine(settings.database_url)

    try:
        with engine.connect() as conn:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'submissions'
                AND column_name = 'investigator_notes'
            """))

            if result.fetchone():
                print("✅ investigator_notes column already exists")
                return

            # Add the column
            print("📝 Adding investigator_notes column to submissions table...")
            conn.execute(text("""
                ALTER TABLE submissions
                ADD COLUMN investigator_notes TEXT
            """))

            # Commit the transaction
            conn.commit()

            print("✅ Successfully added investigator_notes column")

    except Exception as e:
        print(f"❌ Error adding column: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("🔄 Running database migration...")
    add_investigator_notes_column()
    print("✅ Migration completed successfully!")