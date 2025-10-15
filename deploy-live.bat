@echo off
echo 🚀 CIPC Agent - Live Deployment Starting...

REM Kill existing processes
echo Stopping existing services...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.exe 2>nul

REM Install dependencies
echo Installing dependencies...
cd /d "c:\Users\Adrin\Documents\MyProjects\CIPC-Agent"
call npm install

cd server
call npm install

cd ..\client  
call npm install

cd ..

REM Build client
echo Building client...
cd client
call npm run build

cd ..

REM Start services
echo Starting services...

REM Start webhook server
start "CIPC Webhook" cmd /k "cd /d c:\Users\Adrin\Documents\MyProjects\CIPC-Agent && set PORT=3001 && node webhook.js"

REM Wait 3 seconds
timeout /t 3 /nobreak >nul

REM Start main server
start "CIPC Server" cmd /k "cd /d c:\Users\Adrin\Documents\MyProjects\CIPC-Agent\server && npm run dev"

REM Wait 3 seconds  
timeout /t 3 /nobreak >nul

REM Start client dev server
start "CIPC Client" cmd /k "cd /d c:\Users\Adrin\Documents\MyProjects\CIPC-Agent\client && npm run dev"

echo.
echo ✅ CIPC Agent deployed successfully!
echo.
echo 📱 Services running:
echo   - Webhook: http://localhost:3001
echo   - Server: http://localhost:8080  
echo   - Client: http://localhost:5173
echo.
echo 🔧 Next steps:
echo   1. Configure AiSensy webhook: http://your-domain:3001/webhook
echo   2. Update CIPC credentials in .env.production
echo   3. Test WhatsApp integration
echo.
pause