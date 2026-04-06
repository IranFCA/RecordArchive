#!/usr/bin/env python3
"""
View contact form submissions from the Records Archive database.
"""
import sys
from pathlib import Path

# Add the app directory to the Python path (for running inside Docker)
app_dir = Path(__file__).parent / "app"
if app_dir.exists():
    sys.path.insert(0, str(app_dir))

from app.database import SessionLocal
from app.models import Contact

def view_contacts(limit: int = 50):
    """View contact form submissions."""
    db = SessionLocal()
    try:
        contacts = db.query(Contact).order_by(Contact.created_at.desc()).limit(limit).all()

        if not contacts:
            print("No contact form submissions found.")
            return

        print(f"Found {len(contacts)} contact form submission(s):")
        print("=" * 80)

        for i, contact in enumerate(contacts, 1):
            print(f"\n--- Contact #{i} ---")
            print(f"ID: {contact.id}")
            print(f"Name: {contact.name}")
            print(f"Email: {contact.email}")
            print(f"Subject: {contact.subject}")
            print(f"Created: {contact.created_at}")
            print(f"Message:")
            print(f"  {contact.message}")
            print("-" * 40)

    except Exception as e:
        print(f"Error viewing contacts: {e}")
    finally:
        db.close()

def main():
    limit = 50  # Default limit

    if len(sys.argv) > 1:
        try:
            limit = int(sys.argv[1])
        except ValueError:
            print("Error: Limit must be a number")
            sys.exit(1)

    print(f"Viewing last {limit} contact form submissions...")
    view_contacts(limit)

if __name__ == "__main__":
    main()