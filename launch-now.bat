@echo off
title CIPC-Agent Production Launch
color 0A

echo.
echo  ██████╗██╗██████╗  ██████╗      █████╗  ██████╗ ███████╗███╗   ██╗████████╗
echo ██╔════╝██║██╔══██╗██╔════╝     ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
echo ██║     ██║██████╔╝██║          ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   
echo ██║     ██║██╔═══╝ ██║          ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   
echo ╚██████╗██║██║     ╚██████╗     ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   
echo  ╚═════╝╚═╝╚═╝      ╚═════╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   
echo.
echo                        🚀 PRODUCTION LAUNCH SEQUENCE 🚀
echo                     ═══════════════════════════════════════
echo.

echo [1/4] 🔧 Killing existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/4] 📱 Starting WhatsApp Webhook Server...
start "CIPC-Webhook" cmd /k "title CIPC Webhook Server && cd /d %~dp0 && echo 📱 Starting webhook on port 3001... && node webhook.js"
timeout /t 3 >nul

echo [3/4] 🔧 Starting Main API Server...
start "CIPC-Server" cmd /k "title CIPC API Server && cd /d %~dp0server && echo 🔧 Starting API server... && npm run dev"
timeout /t 3 >nul

echo [4/4] 🌐 Starting Client Interface...
start "CIPC-Client" cmd /k "title CIPC Client && cd /d %~dp0client && echo 🌐 Starting client... && npm run dev"
timeout /t 2 >nul

echo.
echo ✅ CIPC-Agent Platform LAUNCHED!
echo ═══════════════════════════════════
echo.
echo 📱 WhatsApp Webhook: http://localhost:3001/webhook
echo 🔧 API Server:       http://localhost:8080
echo 🌐 Client App:       http://localhost:3000
echo 📊 Health Check:     http://localhost:3001/health
echo.
echo 🎯 TEST COMMANDS:
echo ─────────────────
echo curl http://localhost:3001/health
echo curl -X POST http://localhost:3001/webhook -H "Content-Type: application/json" -d "{\"from\":\"+27123456789\",\"message\":\"SCORE 2020/123456/07\",\"type\":\"text\"}"
echo.
echo 💰 REVENUE READY: Configure AiSensy webhook to start earning!
echo 📋 Next: Update .env with CIPC credentials and PayFast keys
echo.
pause