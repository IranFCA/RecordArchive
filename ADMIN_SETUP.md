# Records Archive Admin Setup Guide

## Prerequisites

Make sure Docker and Docker Compose are installed and running.

## Quick Start

### 1. Start Docker Containers
```bash
docker-compose up -d
```

**Note:** If you updated the codebase recently, you may need to rebuild the containers:
```bash
docker-compose down
docker-compose up -d --build
```

### 2. Set up the Database
```bash
./manage_admin.sh setup
```

### 3. Create Your First Admin User
```bash
./manage_admin.sh create admin@example.com mypassword123
```

### 4. Check System Status
```bash
./manage_admin.sh status
```

## Available Commands

| Command | Description |
|---------|-------------|
| `install` | Install Python dependencies |
| `setup` | Initial database setup |
| `create <email> <password>` | Create new admin user |
| `list` | List all admin users |
| `delete <email>` | Delete admin user |
| `reset-mfa <email>` | Reset MFA for user |
| `status` | Show system status |
| `help` | Show help |

## Troubleshooting

### "Backend Docker container is not running"
**Error:** Docker containers need to be started first
**Solution:** Start the containers
```bash
docker-compose up -d
```

### "ModuleNotFoundError: No module named 'sqlalchemy'"
**Solution:** This shouldn't happen if Docker is running, but if it does:
```bash
# Rebuild the backend container
docker-compose build backend
docker-compose up -d
```

### "Not in the correct Records Archive directory"
**Error:** Make sure you're running the script from the Records Archive root directory
```bash
cd /path/to/RecordsArchive
./manage_admin.sh list
```

### "Permission denied" or Docker issues
**Solution:** Make sure Docker is running and you have permissions
```bash
# Check Docker status
docker ps

# If Docker isn't running, start it
sudo systemctl start docker
```

## Environment Variables

Make sure your `.env` file contains:
```
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key-here
VITE_API_BASE_URL=http://localhost:8000
VITE_ADMIN_ROUTE_PATH=/admin
```

## Admin Dashboard Access

Once you have admin users created, you can:

1. **Login** at `/admin` (or your configured admin route)
2. **View submissions** in the "پرونده‌ها" (Submissions) tab
3. **View contacts** in the "تماس‌ها" (Contacts) tab
4. **Manage users** and system settings

## Security Notes

- Admin routes are protected with JWT authentication
- MFA (Multi-Factor Authentication) is available for admin accounts
- All admin actions are logged
- Use strong passwords for admin accounts

## Support

If you encounter issues:
1. Check `./manage_admin.sh status` for system health
2. Ensure all dependencies are installed
3. Verify database connection
4. Check logs in the backend directory