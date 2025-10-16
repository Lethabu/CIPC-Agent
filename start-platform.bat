@echo off
echo Starting CIPC-Agent Platform...

echo Copying environment configuration...
copy .env.complete .env

echo Building and starting all services...
docker-compose up --build -d

echo Waiting for services to start...
timeout /t 30

echo Platform Status:
echo ==================
echo Temporal UI: http://localhost:8233
echo Node Server: http://localhost:3000
echo Database: localhost:5432
echo Redis: localhost:6379

echo.
echo Platform started successfully!
echo Check logs with: docker-compose logs -f
pause