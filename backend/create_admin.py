#!/usr/bin/env python3
"""
Create admin user for the Records Archive application.
"""
import sys
import os
from pathlib import Path

# Add the app directory to the Python path (for running inside Docker)
app_dir = Path(__file__).parent / "app"
if app_dir.exists():
    sys.path.insert(0, str(app_dir))

from app.database import SessionLocal, engine
from app.models import User, UserRole
from app.crud import create_user
from app.api.auth import get_password_hash

def create_admin_user(email: str, password: str):
    """Create an admin user."""
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User {email} already exists!")
            return False

        # Create admin user
        user = create_user(db, email, password, UserRole.ADMIN)
        print(f"Admin user created successfully!")
        print(f"Email: {user.email}")
        print(f"Role: {user.role.value}")
        print(f"Created: {user.created_at}")
        return True

    except Exception as e:
        print(f"Error creating admin user: {e}")
        return False
    finally:
        db.close()

def main():
    if len(sys.argv) != 3:
        print("Usage: python create_admin.py <email> <password>")
        print("Example: python create_admin.py admin@example.com mypassword123")
        sys.exit(1)

    email = sys.argv[1]
    password = sys.argv[2]

    # Validate email format
    if "@" not in email:
        print("Error: Invalid email format")
        sys.exit(1)

    # Validate password length
    if len(password) < 8:
        print("Error: Password must be at least 8 characters long")
        sys.exit(1)

    print(f"Creating admin user: {email}")
    success = create_admin_user(email, password)

    if success:
        print("\n✅ Admin user created successfully!")
        print("You can now login to the admin panel.")
    else:
        print("\n❌ Failed to create admin user!")
        sys.exit(1)

if __name__ == "__main__":
    main()