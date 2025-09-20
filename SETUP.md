# Local Development Setup Guide

## Prerequisites Installation

Since Node.js and Docker are not currently installed on your system, you'll need to install them first.

### 1. Install Node.js and npm

#### Option A: Using Homebrew (Recommended)
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (includes npm)
brew install node
```

#### Option B: Direct Download
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version for macOS
3. Run the installer

### 2. Install Docker Desktop

#### Option A: Using Homebrew
```bash
brew install --cask docker
```

#### Option B: Direct Download
1. Go to [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Download Docker Desktop for Mac
3. Install and launch Docker Desktop

### 3. Verify Installations

After installing both, verify they're working:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
docker --version  # Should show Docker version info
docker-compose --version  # Should show docker-compose version
```

## Quick Start (After Prerequisites)

Once Node.js and Docker are installed:

```bash
# 1. Install dependencies
npm install

# 2. Start the database
npm run db:up

# 3. Start the development server
npm run dev
```

Then access:
- **Application**: http://localhost:3000
- **Database Admin**: http://localhost:8080

## Troubleshooting

### If docker-compose command not found:
Docker Desktop includes docker-compose. If it's still not found:
```bash
# Try using docker compose (without hyphen) - newer syntax
docker compose up -d
```

### If database connection fails:
1. Ensure Docker Desktop is running
2. Check if containers are running: `docker ps`
3. Check container logs: `docker-compose logs postgres`

### If npm install fails:
1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules: `rm -rf node_modules`
3. Retry: `npm install`

## Manual Database Setup (Alternative)

If you prefer not to use Docker, you can install PostgreSQL directly:

```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database and user
createdb loan_app
psql loan_app -c "CREATE USER loan_user WITH PASSWORD 'loan_password';"
psql loan_app -c "GRANT ALL PRIVILEGES ON DATABASE loan_app TO loan_user;"

# Run schema and seed scripts
psql -U loan_user -d loan_app -f database/init.sql
psql -U loan_user -d loan_app -f database/seed.sql
```

Then update `.env.local` with:
```bash
DATABASE_URL=postgresql://loan_user:loan_password@localhost:5432/loan_app
```