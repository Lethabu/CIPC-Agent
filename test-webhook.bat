@echo off
echo Testing CIPC-Agent Webhook Integration...

echo 1. Testing health endpoint...
curl -f http://localhost:3001/health

echo.
echo 2. Testing compliance check...
curl -X POST http://localhost:3001/webhook -H "Content-Type: application/json" -d "{\"from\":\"+27123456789\",\"message\":\"SCORE 2020/123456/07\",\"type\":\"text\"}"

echo.
echo 3. Testing annual return request...
curl -X POST http://localhost:3001/webhook -H "Content-Type: application/json" -d "{\"from\":\"+27123456789\",\"message\":\"AR\",\"type\":\"text\"}"

pause