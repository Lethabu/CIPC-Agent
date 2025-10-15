@echo off
echo 🚀 CIPC-Agent Quick Start
echo ========================

echo 1. Starting webhook server...
start "CIPC-Webhook" cmd /k "cd /d C:\Users\Adrin\Documents\MyProjects\CIPC-Agent && node webhook.js"

timeout /t 3

echo 2. Starting main server...
start "CIPC-Server" cmd /k "cd /d C:\Users\Adrin\Documents\MyProjects\CIPC-Agent\server && npm run dev"

timeout /t 3

echo 3. Starting client...
start "CIPC-Client" cmd /k "cd /d C:\Users\Adrin\Documents\MyProjects\CIPC-Agent\client && npm run dev"

echo ✅ All services starting!
echo 📱 Webhook: http://localhost:3001/webhook
echo 🔧 Server: http://localhost:8080  
echo 🌐 Client: http://localhost:3000

echo.
echo 📋 Test the webhook:
echo curl -X POST http://localhost:3001/webhook -H "Content-Type: application/json" -d "{\"from\":\"+27123456789\",\"message\":\"SCORE 2020/123456/07\",\"type\":\"text\"}"

pause