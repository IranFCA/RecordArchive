#!/usr/bin/env python3
"""
Reset MFA for a user in the Records Archive application.
"""
import sys
from pathlib import Path

# Add the app directory to the Python path (for running inside Docker)
app_dir = Path(__file__).parent / "app"
if app_dir.exists():
    sys.path.insert(0, str(app_dir))

from app.database import SessionLocal
from app.models import User

def reset_user_mfa(email: str):
    """Reset MFA settings for a user."""
    db = SessionLocal()
    try:
        # Find the user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User {email} not found!")
            return False

        # Reset MFA settings
        user.mfa_enabled = False
        user.mfa_secret = None
        db.commit()

        print(f"MFA reset successfully for user: {email}")
        print("User will need to set up MFA again on next login.")
        return True

    except Exception as e:
        print(f"Error resetting MFA: {e}")
        return False
    finally:
        db.close()

def main():
    if len(sys.argv) != 2:
        print("Usage: python reset_mfa.py <email>")
        print("Example: python reset_mfa.py admin@example.com")
        sys.exit(1)

    email = sys.argv[1]

    # Validate email format
    if "@" not in email:
        print("Error: Invalid email format")
        sys.exit(1)

    print(f"Resetting MFA for user: {email}")
    success = reset_user_mfa(email)

    if success:
        print("\n✅ MFA reset successfully!")
        print("The user can set up MFA again from the admin dashboard.")
    else:
        print("\n❌ Failed to reset MFA!")
        sys.exit(1)

if __name__ == "__main__":
    main()