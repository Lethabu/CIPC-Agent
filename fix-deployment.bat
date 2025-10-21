@echo off
echo 🔧 Fixing CIPC Agent deployment...

REM Kill existing processes
taskkill /F /IM node.exe 2>nul
taskkill /F /IM worker.exe 2>nul

REM Check if client dist exists, if not build it
if not exist "client\dist" (
    echo 📦 Building client...
    cd client
    call npm install
    call npm run build
    cd ..
) else (
    echo ✅ Client already built
)

REM Start Docker services
echo 🐳 Starting Docker services...
docker-compose up -d postgres redis temporal

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak

REM Start static server
echo 🌐 Starting static server...
cd server
start "CIPC Static" cmd /k "set PORT=3000 && node static-server.js"

REM Start webhook server
echo 📡 Starting webhook server...
cd ..
start "CIPC Webhook" cmd /k "set PORT=3001 && node webhook.js"

REM Start API server
echo 🔌 Starting API server...
cd server
start "CIPC API" cmd /k "set PORT=8080 && npm run dev"

REM Start Go worker
echo ⚙️ Starting Go worker...
cd ..
start "CIPC Worker" cmd /k "go run cmd/api/main.go"

echo.
echo ✅ CIPC Agent deployment fixed and running!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 📡 Webhook: http://localhost:3001  
echo 🔌 API: http://localhost:8080
echo 🎛️ Temporal UI: http://localhost:8233
echo.
echo 📊 Health checks:
echo - Frontend: curl http://localhost:3000
echo - Webhook: curl http://localhost:3001/health
echo - API: curl http://localhost:8080/health
echo.
pause