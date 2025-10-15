@echo off
echo 🚀 CIPC-Agent Production Deployment
echo ===================================

echo 1. Building client...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Client build failed
    pause
    exit /b 1
)

echo 2. Building server...
cd ..\server
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Server build failed
    pause
    exit /b 1
)

echo 3. Installing Python dependencies...
cd ..\automation
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Python dependencies failed
    pause
    exit /b 1
)

echo 4. Testing CIPC runner...
python cipc_runner.py check_compliance 2020/123456/07
if %errorlevel% neq 0 (
    echo ⚠️ CIPC runner test failed - continuing anyway
)

echo 5. Starting production services...
cd ..
docker-compose -f docker-compose.yml up -d postgres redis

echo 6. Waiting for database...
timeout /t 15

echo 7. Running database migrations...
call npm run db:migrate

echo 8. Starting production server...
set NODE_ENV=production
start "CIPC-Production" cmd /k "node server/dist/app.js"

echo 9. Starting webhook server...
start "CIPC-Webhook" cmd /k "node webhook.js"

echo ✅ Production deployment complete!
echo 🌐 Server: http://localhost:8080
echo 📱 Webhook: http://localhost:3001/webhook
echo 📊 Health: http://localhost:3001/health

echo.
echo 📋 Next steps:
echo 1. Configure AiSensy webhook to: http://your-domain.com:3001/webhook
echo 2. Update PayFast return URLs to your domain
echo 3. Set up SSL certificate for production
echo 4. Configure monitoring and alerts

pause