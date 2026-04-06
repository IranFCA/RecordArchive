#!/bin/bash
set -euo pipefail

# Records Archive Admin Management Script
# Usage: ./manage_admin.sh [command] [options]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Note: Environment variables are loaded automatically by the Python application
# We don't source the .env file here as it may contain non-shell variables

# Function to print usage
usage() {
    echo "Records Archive Admin Management Script"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  install                      Install Python dependencies"
    echo "  create <email> <password>    Create a new admin user"
    echo "  list                         List all admin users"
    echo "  delete <email>               Delete an admin user"
    echo "  reset-mfa <email>            Reset MFA for a user"
    echo "  setup                        Initial setup (create database, first admin)"
    echo "  status                       Show system status"
    echo "  help                         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 create admin@example.com mypassword123"
    echo "  $0 list"
    echo "  $0 delete admin@example.com"
    echo "  $0 reset-mfa admin@example.com"
    echo "  $0 setup"
}

# Function to install Python dependencies
install_deps() {
    echo -e "${BLUE}Installing Python dependencies...${NC}"

    if command -v pip3 &> /dev/null; then
        pip3 install -r "$BACKEND_DIR/requirements.txt"
        echo -e "${GREEN}Dependencies installed successfully!${NC}"
    elif command -v pip &> /dev/null; then
        pip install -r "$BACKEND_DIR/requirements.txt"
        echo -e "${GREEN}Dependencies installed successfully!${NC}"
    else
        echo -e "${RED}Error: pip not found. Please install pip first.${NC}"
        echo -e "${YELLOW}You can install pip with: sudo apt install python3-pip${NC}"
        exit 1
    fi
}

# Function to check if we're in a virtual environment
check_venv() {
    if [ -z "${VIRTUAL_ENV:-}" ]; then
        echo -e "${YELLOW}Warning: Not in a virtual environment. Consider activating one.${NC}"
        echo -e "${YELLOW}You can activate it with: source venv/bin/activate${NC}"
    fi
}

# Function to check if Docker containers are running
check_docker() {
    if ! docker ps | grep -q jap_backend; then
        echo -e "${RED}Error: Backend Docker container is not running.${NC}"
        echo -e "${YELLOW}Please start the containers with:${NC}"
        echo -e "  docker-compose up -d"
        return 1
    fi
    return 0
}

# Function to check if we're in the correct directory
check_directory() {
    if [ ! -f "$SCRIPT_DIR/backend/requirements.txt" ]; then
        echo -e "${RED}Error: Not in the correct Records Archive directory.${NC}"
        echo -e "${YELLOW}Please run this script from the Records Archive root directory.${NC}"
        return 1
    fi
    return 0
}

# Function to create admin user
create_admin() {
    local email="$1"
    local password="$2"

    if [ -z "$email" ] || [ -z "$password" ]; then
        echo -e "${RED}Error: Email and password are required${NC}"
        echo "Usage: $0 create <email> <password>"
        exit 1
    fi

    echo -e "${BLUE}Creating admin user: $email${NC}"

    # Run the Python script inside Docker container
    if ! docker exec jap_backend python /app/create_admin.py "$email" "$password"; then
        echo -e "${RED}Failed to create admin user${NC}"
        exit 1
    fi
}

# Function to list admin users
list_admins() {
    echo -e "${BLUE}Listing admin users...${NC}"

    # Run Python script inside Docker container
    docker exec jap_backend python -c "
import sys
from pathlib import Path
backend_dir = Path('/app')
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models import User, UserRole

db = SessionLocal()
try:
    admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
    if not admins:
        print('No admin users found.')
    else:
        print(f'Found {len(admins)} admin user(s):')
        print('-' * 50)
        for admin in admins:
            mfa_status = 'Enabled' if admin.mfa_enabled else 'Disabled'
            print(f'Email: {admin.email}')
            print(f'MFA: {mfa_status}')
            print(f'Created: {admin.created_at}')
            print('-' * 30)
finally:
    db.close()
"
}

# Function to delete admin user
delete_admin() {
    local email="$1"

    if [ -z "$email" ]; then
        echo -e "${RED}Error: Email is required${NC}"
        echo "Usage: $0 delete <email>"
        exit 1
    fi

    echo -e "${YELLOW}Warning: This will permanently delete the admin user '$email'${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operation cancelled."
        exit 0
    fi

    echo -e "${BLUE}Deleting admin user: $email${NC}"

    # Run Python script inside Docker container
    docker exec jap_backend python -c "
import sys
from pathlib import Path
backend_dir = Path('/app')
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.crud import delete_user

db = SessionLocal()
try:
    success = delete_user(db, '$email')
    if success:
        print('Admin user deleted successfully.')
    else:
        print('Admin user not found.')
        sys.exit(1)
finally:
    db.close()
"
}

# Function to reset MFA
reset_mfa() {
    local email="$1"

    if [ -z "$email" ]; then
        echo -e "${RED}Error: Email is required${NC}"
        echo "Usage: $0 reset-mfa <email>"
        exit 1
    fi

    echo -e "${BLUE}Resetting MFA for user: $email${NC}"

    # Run the reset_mfa.py script inside Docker container
    if ! docker exec jap_backend python /app/reset_mfa.py "$email"; then
        echo -e "${RED}Failed to reset MFA${NC}"
        exit 1
    fi
}

# Function for initial setup
setup() {
    echo -e "${BLUE}Running initial setup...${NC}"

    # Check if database exists and create tables
    echo "Setting up database..."
    docker exec jap_backend python -c "
import sys
from pathlib import Path
backend_dir = Path('/app')
sys.path.insert(0, str(backend_dir))

from app.database import engine
from app.models import Base

Base.metadata.create_all(bind=engine)
print('Database tables created successfully.')
"

    # Create uploads directory
    mkdir -p "$SCRIPT_DIR/uploads"
    echo "Created uploads directory."

    # Create first admin user
    echo -e "${YELLOW}Now create your first admin user:${NC}"
    echo "Example: $0 create admin@example.com mypassword123"
}

# Function to show system status
status() {
    echo -e "${BLUE}System Status${NC}"
    echo "=============="

    # Check if Docker containers are running
    echo -n "Docker containers: "
    if docker ps | grep -q jap_backend && docker ps | grep -q jap_db; then
        echo -e "${GREEN}✓ Running${NC}"
    else
        echo -e "${RED}✗ Not running${NC}"
        echo -e "${YELLOW}Start with: docker-compose up -d${NC}"
        return 1
    fi

    # Check database connection
    echo -n "Database: "
    if docker exec jap_backend python -c "
import sys
from pathlib import Path
backend_dir = Path('/app')
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    db.execute(text('SELECT 1'))
    print('Connected')
except Exception as e:
    print(f'Error: {e}')
    sys.exit(1)
finally:
    db.close()
" 2>/dev/null; then
        echo -e "${GREEN}✓ Connected${NC}"
    else
        echo -e "${RED}✗ Connection failed${NC}"
    fi

    # Check admin users
    echo -n "Admin users: "
    admin_count=$(docker exec jap_backend python -c "
import sys
from pathlib import Path
backend_dir = Path('/app')
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models import User, UserRole

db = SessionLocal()
try:
    count = db.query(User).filter(User.role == UserRole.ADMIN).count()
    print(count)
finally:
    db.close()
" 2>/dev/null || echo "0")

    if [ "$admin_count" -gt 0 ]; then
        echo -e "${GREEN}✓ $admin_count admin user(s)${NC}"
    else
        echo -e "${YELLOW}⚠ No admin users found${NC}"
    fi

    # Check uploads directory
    if [ -d "$SCRIPT_DIR/uploads" ]; then
        file_count=$(find "$SCRIPT_DIR/uploads" -type f | wc -l)
        echo -e "${GREEN}✓ Uploads directory: $file_count file(s)${NC}"
    else
        echo -e "${RED}✗ Uploads directory missing${NC}"
    fi

    # Check environment variables
    echo -n "Environment: "
    if [ -n "${VITE_ADMIN_ROUTE_PATH:-}" ]; then
        echo -e "${GREEN}✓ Admin route configured${NC}"
    else
        echo -e "${YELLOW}⚠ Admin route not configured${NC}"
    fi
}

# Main script logic
case "${1:-help}" in
    install)
        check_directory || exit 1
        install_deps
        ;;
    create)
        check_directory || exit 1
        check_docker || exit 1
        create_admin "${2:-}" "${3:-}"
        ;;
    list)
        check_directory || exit 1
        check_docker || exit 1
        list_admins
        ;;
    delete)
        check_directory || exit 1
        check_docker || exit 1
        delete_admin "${2:-}"
        ;;
    reset-mfa)
        check_directory || exit 1
        check_docker || exit 1
        reset_mfa "${2:-}"
        ;;
    setup)
        check_directory || exit 1
        check_docker || exit 1
        setup
        ;;
    status)
        check_directory || exit 1
        check_docker || exit 1
        status
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        usage
        exit 1
        ;;
esac
