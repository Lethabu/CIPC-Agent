@echo off
echo 🏥 CIPC Agent Health Check...
echo.

echo 🔍 Checking services...
echo.

REM Check Frontend
echo 🌐 Frontend (Port 3000):
curl -s -o nul -w "Status: %%{http_code}" http://localhost:3000
if %errorlevel% equ 0 (
    echo  ✅ ONLINE
) else (
    echo  ❌ OFFLINE
)

echo.

REM Check Webhook
echo 📡 Webhook (Port 3001):
curl -s -o nul -w "Status: %%{http_code}" http://localhost:3001/health
if %errorlevel% equ 0 (
    echo  ✅ ONLINE
) else (
    echo  ❌ OFFLINE
)

echo.

REM Check API
echo 🔌 API (Port 8080):
curl -s -o nul -w "Status: %%{http_code}" http://localhost:8080/health
if %errorlevel% equ 0 (
    echo  ✅ ONLINE
) else (
    echo  ❌ OFFLINE
)

echo.

REM Check Temporal
echo ⏰ Temporal UI (Port 8233):
curl -s -o nul -w "Status: %%{http_code}" http://localhost:8233
if %errorlevel% equ 0 (
    echo  ✅ ONLINE
) else (
    echo  ❌ OFFLINE
)

echo.

REM Check Docker services
echo 🐳 Docker Services:
docker ps --format "table {{.Names}}\t{{.Status}}" --filter "name=cipc"

echo.
echo 📊 System Status Summary:
echo - Frontend: http://localhost:3000
echo - Webhook: http://localhost:3001/webhook
echo - API: http://localhost:8080
echo - Temporal: http://localhost:8233
echo.
pause