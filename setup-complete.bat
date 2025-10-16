@echo off
echo ========================================
echo CIPC-Agent Complete Setup
echo ========================================

echo Step 1: Environment Setup
copy .env.complete .env
echo ✓ Environment configured

echo Step 2: Installing Dependencies
cd server
call npm install
cd ..
echo ✓ Node.js dependencies installed

echo Step 3: Go Dependencies
go mod tidy
echo ✓ Go dependencies updated

echo Step 4: Database Migration
docker-compose up postgres -d
timeout /t 10
echo ✓ Database ready

echo Step 5: Starting All Services
docker-compose up --build -d
echo ✓ All services started

echo Step 6: Verification
timeout /t 30
curl -s http://localhost:3000/health > nul
if %errorlevel% == 0 (
    echo ✓ API Server healthy
) else (
    echo ✗ API Server not responding
)

echo.
echo ========================================
echo CIPC-Agent Platform Ready!
echo ========================================
echo Temporal UI: http://localhost:8233
echo API Server: http://localhost:3000
echo Database: localhost:5432
echo.
echo Next Steps:
echo 1. Configure Typebot webhooks
echo 2. Add API keys to .env
echo 3. Test webhook endpoints
echo 4. Monitor via Temporal UI
echo ========================================
pause