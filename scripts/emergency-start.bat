@echo off
echo 🚀 CIPC-Agent Emergency Startup
echo ================================

echo 1. Checking Node.js...
node --version || (echo ❌ Node.js not found && exit /b 1)

echo 2. Installing dependencies...
cd server
npm install --silent
cd ..

echo 3. Starting database...
docker-compose up -d postgres redis

echo 4. Waiting for database...
timeout /t 10

echo 5. Running migrations...
npm run db:migrate

echo 6. Starting server...
start "CIPC-Server" cmd /k "cd server && npm run dev"

echo 7. Starting client...
start "CIPC-Client" cmd /k "cd client && npm run dev"

echo ✅ CIPC-Agent started!
echo 📱 Client: http://localhost:3000
echo 🔧 Server: http://localhost:8080
echo 📊 Health: http://localhost:8080/health

pause