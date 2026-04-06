# Justice Archive Platform

A secure evidence intake and archival system for collecting documents and structured reports related to alleged financial or organizational links to the Iranian regime outside the country.

## Features

### Phase 1 (Completed)
- **Secure Evidence Submission**: Multi-step form with captcha protection
- **Anonymous Submissions**: Optional anonymous submission support
- **Investigator Portal**: Secure login with Multi-Factor Authentication (MFA)
- **Modern UI**: Responsive React frontend with Material-UI
- **FastAPI Backend**: RESTful API with JWT authentication
- **Database**: PostgreSQL with comprehensive data models

### Security Features
- **Captcha Protection**: Google reCAPTCHA on all forms
- **Two-Factor Authentication**: TOTP-based MFA for investigators
- **JWT Authentication**: Secure token-based sessions
- **Password Hashing**: bcrypt encryption
- **Input Validation**: Comprehensive form validation

## Security Model

This system is designed as a **private evidence intake and archival platform** for sensitive information related to alleged financial or organizational links to the Iranian regime.

### Principles

- **No public access** to submitted data
- **All submissions treated as unverified** until reviewed
- **Evidence stored securely** with access controls
- **Admin access requires multi-factor authentication (MFA)**
- **Data integrity** maintained through hashing and validation

### Access Control

- **Public users**: Submission only (anonymous or contact-based)
- **Investigators**: Authenticated + MFA required
- **Admin routes**: Protected at infrastructure level (VPN or IP restriction recommended)

### Threat Model (MVP)

The system protects against:

- **Unauthorized access** to submissions
- **Credential stuffing** and brute-force attacks
- **Data tampering** (via file hashing)
- **Basic bot submissions** (via captcha)
- **Session hijacking** (via short-lived tokens)

### Future Security Enhancements

- **Advanced anonymity** (Tor integration)
- **Metadata stripping** from uploaded files
- **Secure evidence chain-of-custody**
- **Malware scanning** for uploads
- **Audit logging** for all access
- **End-to-end encryption** for sensitive data

### JWT Security Notes

- **Short-lived access tokens** (15-30 minutes recommended)
- **Use refresh tokens** for session continuation
- **Store tokens securely** (HTTP-only cookies preferred over localStorage)
- **Never expose tokens in localStorage** in production environments
- **Implement token rotation** for enhanced security

### File Upload Restrictions

**MVP Limits:**
- **Allowed types**: PDF, JPG, PNG, DOCX, TXT
- **Max size**: 10MB per file
- **Total submission**: 50MB maximum
- **File count**: Maximum 5 files per submission

**Security Measures:**
- **Content validation** on upload
- **File type verification** (not just extension)
- **Virus scanning** (recommended for production)

**Future Enhancements:**
- **Metadata stripping** from images/documents
- **Content analysis** for sensitive information
- **Secure storage** with encryption at rest

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ and npm (for frontend development)
- Python 3.11+ (for backend development)

### 1. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env file with your settings
nano .env
```

**Important**: Change the default passwords in `.env`:
- `POSTGRES_PASSWORD=change_me` → Use a strong password
- Add `SECRET_KEY=your-256-bit-secret-key-here` for JWT tokens

### 2. Database Setup

```bash
# Start PostgreSQL database
docker compose up db -d

# Wait for database to be ready, then initialize
docker compose run --rm backend python -m app.init_db
```

### 3. Backend Development

```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Run backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API Documentation: http://localhost:8000/docs

### 4. Frontend Development

```bash
# Install Node dependencies
cd frontend
npm install

# Run development server
npm run dev
```

Frontend: http://localhost:5173

### 5. Full Stack with Docker

```bash
# Build and run everything (development)
docker compose up --build

# Or run in background
docker compose up -d --build
```

### 6. Production Deployment

For production deployment with static frontend serving:

```bash
# Build and run production stack
docker compose -f docker-compose.yml up --build

# Access points:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**Production Architecture:**
- **Frontend**: Nginx serving built React app with API proxy
- **Backend**: FastAPI with JWT authentication and MFA
- **Database**: PostgreSQL with persistent volumes
- **File Storage**: Docker volumes for evidence uploads

## User Management

### Adding Admin Users

Create a Python script to add admin users:

```python
# create_admin.py
import sys
import os
sys.path.append('backend')

from app.database import SessionLocal
from app.crud import create_user
from app.models import UserRole

def main():
    if len(sys.argv) != 3:
        print("Usage: python create_admin.py <email> <password>")
        sys.exit(1)

    email = sys.argv[1]
    password = sys.argv[2]

    db = SessionLocal()
    try:
        user = create_user(db, email, password, UserRole.ADMIN)
        print(f"Admin user created: {user.email} (ID: {user.id})")
    except Exception as e:
        print(f"Error creating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
```

Run the script:

```bash
cd RecordsArchive
python create_admin.py admin@example.com strongpassword123
```

### Resetting MFA for Users

If a user loses access to their MFA device, reset their MFA:

```python
# reset_mfa.py
import sys
import os
sys.path.append('backend')

from app.database import SessionLocal
from app.crud import get_user_by_email

def main():
    if len(sys.argv) != 2:
        print("Usage: python reset_mfa.py <email>")
        sys.exit(1)

    email = sys.argv[1]

    db = SessionLocal()
    try:
        user = get_user_by_email(db, email)
        if not user:
            print(f"User not found: {email}")
            return

        user.mfa_secret = None
        user.mfa_enabled = False
        db.commit()
        print(f"MFA reset for user: {user.email}")
        print("User can now log in with password only and re-setup MFA")
    except Exception as e:
        print(f"Error resetting MFA: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
```

Run the script:

```bash
cd RecordsArchive
python reset_mfa.py admin@example.com
```

### Production Admin Management

For production deployments with Docker containers, use the admin management script:

```bash
# Make sure containers are running
docker compose up -d

# Create admin user
./manage_admin.sh create-admin admin@example.com MySecurePass123!

# Reset MFA for a user
./manage_admin.sh reset-mfa admin@example.com

# List all admin users
./manage_admin.sh list-admins

# Show help
./manage_admin.sh help
```

**Production Notes:**
- The script runs Python commands inside the backend Docker container
- No need to install Python locally on the production server
- All database operations happen within the containerized environment
- Safe for production use with proper access controls

## Configuration

### Environment Variables

The `.env` file contains:

```env
# Database
POSTGRES_DB=your_db_name
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_strong_password
DATABASE_URL=postgresql://your_db_user:your_strong_password@db:5432/your_db_name

# Application
APP_NAME=Justice Archive Platform API
DEBUG=true
SECRET_KEY=your-256-bit-secret-key-here
TURNSTILE_SECRET_KEY=your-turnstile-secret-key-here
```

**Yes, you can and should change the passwords in `.env`**:
- Change `POSTGRES_PASSWORD` to a strong, unique password
- Add a `SECRET_KEY` for JWT token signing (use a long random string)
- Never commit `.env` to version control

## Project Structure

```
RecordsArchive/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── models.py     # Database models
│   │   ├── schemas.py    # Pydantic schemas
│   │   ├── crud.py       # Database operations
│   │   ├── database.py   # Database connection
│   │   ├── config.py     # Configuration
│   │   └── main.py       # FastAPI app
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── App.tsx       # Main app component
│   │   └── main.tsx      # App entry point
│   ├── package.json      # Node dependencies
│   └── Dockerfile
├── docker-compose.yml    # Docker services
├── .env                  # Environment variables
└── README.md            # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-mfa` - Verify MFA code
- `POST /api/auth/setup-mfa` - Setup MFA (returns QR code)
- `POST /api/auth/enable-mfa` - Enable MFA after setup
- `POST /api/auth/disable-mfa` - Disable MFA

### Submissions
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Create submission
- `GET /api/submissions/{id}` - Get submission details

## Security Notes

This is an MVP implementation. For production use, add:

- Rate limiting and DDoS protection
- File upload scanning and size limits
- Audit logging
- Backup and recovery procedures
- SSL/TLS certificates
- Security headers and CSP
- Regular security updates
- Penetration testing

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality

```bash
# Backend linting
cd backend
flake8 app/
black app/

# Frontend linting
cd frontend
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Disclaimer

This platform is designed for the submission and archival of information.

- Submissions are not verified
- The platform does not make claims about the accuracy of any content
- All information is provided by users and should be treated as unverified

This project is a technical tool and does not constitute legal judgment or accusation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
