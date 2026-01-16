#!/bin/bash
set -e

echo "🚀 FLOTA SYSTEM - AUTOMATYCZNE SETUP"
echo "======================================"
echo ""

# Kolory
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Homebrew check
echo -e "${YELLOW}[1/5]${NC} Sprawdzanie Homebrew..."
if ! command -v brew &> /dev/null; then
    echo "📥 Instaluję Homebrew (może prosić o hasło)..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    eval "$(/opt/homebrew/bin/brew shellenv zsh)"
fi
echo -e "${GREEN}✅ Homebrew OK${NC}"
echo ""

# 2. PostgreSQL check
echo -e "${YELLOW}[2/5]${NC} Sprawdzanie PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "📥 Instaluję PostgreSQL 15..."
    brew install postgresql@15
    echo "🔄 Uruchamiam PostgreSQL..."
    brew services start postgresql@15
    sleep 3
fi
echo -e "${GREEN}✅ PostgreSQL OK${NC}"
echo ""

# 3. Create database
echo -e "${YELLOW}[3/5]${NC} Tworzenie bazy danych flota_db..."
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'flota_db'" | grep -q 1 || \
    psql -U postgres -c "CREATE DATABASE flota_db;"
echo -e "${GREEN}✅ Baza danych OK${NC}"
echo ""

# 4. Backend setup
echo -e "${YELLOW}[4/5]${NC} Setup Backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📥 npm install..."
    npm install --silent
fi
echo -e "${GREEN}✅ Backend OK${NC}"
cd ..
echo ""

# 5. Frontend setup
echo -e "${YELLOW}[5/5]${NC} Setup Admin Web..."
cd admin-web
if [ ! -f "package.json" ]; then
    echo "📥 Tworzę React app..."
    npx create-react-app . --template typescript 2>/dev/null || true
fi
if [ ! -d "node_modules" ]; then
    echo "📥 npm install..."
    npm install --silent
fi
echo -e "${GREEN}✅ Admin Web OK${NC}"
cd ..
echo ""

echo "======================================"
echo -e "${GREEN}✅ SETUP UKOŃCZONY!${NC}"
echo "======================================"
echo ""
echo "🎯 NASTĘPNE KROKI:"
echo ""
echo "1️⃣ Terminal 1 - Uruchom Backend:"
echo "   cd ~/Desktop/flota-system/backend && npm run dev"
echo ""
echo "2️⃣ Terminal 2 - Testuj Backend:"
echo "   curl http://localhost:5000/api/health"
echo ""
echo "3️⃣ Terminal 3 - Uruchom Admin Web:"
echo "   cd ~/Desktop/flota-system/admin-web && npm start"
echo ""

