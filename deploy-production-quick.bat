@echo off
echo 🚀 CIPC Agent - Quick Production Deployment
echo.

REM Build client
echo 📦 Building client for production...
cd client
call npm install --production
call npm run build

REM Check build success
if not exist "dist\index.html" (
    echo ❌ Build failed - no index.html found
    pause
    exit /b 1
)

echo ✅ Client built successfully
cd ..

REM Deploy to Vercel
echo 🌐 Deploying to Vercel...
npx vercel --prod --yes

if %errorlevel% equ 0 (
    echo.
    echo ✅ Deployment successful!
    echo 🌐 Live at: https://www.cipcagent.co.za
    echo.
    echo 🔍 Verifying deployment...
    timeout /t 5 /nobreak
    curl -s -o nul -w "Status: %%{http_code}" https://www.cipcagent.co.za
    if %errorlevel% equ 0 (
        echo ✅ Website is live and responding
    ) else (
        echo ⚠️ Website deployed but may need a few minutes to propagate
    )
) else (
    echo ❌ Deployment failed
    echo 💡 Try: npx vercel login first
)

echo.
pause