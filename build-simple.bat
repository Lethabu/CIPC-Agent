@echo off
echo Building CIPC-Agent Platform...

echo Step 1: Go Worker Build
go build -mod=mod -o worker.exe ./worker
if %errorlevel% == 0 (
    echo ✓ Go worker built successfully
) else (
    echo ✗ Go worker build failed
    exit /b 1
)

echo Step 2: Node.js Server Build
cd server
npm run build
if %errorlevel% == 0 (
    echo ✓ Node.js server built successfully
) else (
    echo ✗ Node.js server build failed
    exit /b 1
)
cd ..

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo Go Worker: worker.exe
echo Node Server: server/dist/app.js
echo.
echo To run:
echo 1. Start worker.exe
echo 2. Start node server/dist/app.js
echo ========================================