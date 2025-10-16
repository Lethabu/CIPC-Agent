@echo off
echo 🔧 CIPC Agent - Fixing Deployment Issues...
echo.

echo ✅ Step 1: Building client application...
cd client
call npm install
call npm run build
cd ..

echo.
echo ✅ Step 2: Deploying to Vercel...
call npx vercel --prod

echo.
echo 🎉 Deployment fix complete!
echo 🌐 Visit: https://www.cipcagent.co.za
echo.
pause