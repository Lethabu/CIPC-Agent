@echo off
echo Testing AiSensy Webhook Configuration...
echo.

echo 1. Testing Welcome Message...
curl -X POST http://localhost:8080/api/webhook/aisensy ^
-H "Content-Type: application/json" ^
-d "{\"from\": \"+27123456789\", \"message\": \"hi\", \"type\": \"text\"}"
echo.
echo.

echo 2. Testing Consent Grant...
curl -X POST http://localhost:8080/api/webhook/aisensy ^
-H "Content-Type: application/json" ^
-d "{\"from\": \"+27123456789\", \"message\": \"YES\", \"type\": \"text\"}"
echo.
echo.

echo 3. Testing Compliance Score...
curl -X POST http://localhost:8080/api/webhook/aisensy ^
-H "Content-Type: application/json" ^
-d "{\"from\": \"+27123456789\", \"message\": \"SCORE\", \"type\": \"text\"}"
echo.
echo.

echo 4. Testing Service Request...
curl -X POST http://localhost:8080/api/webhook/aisensy ^
-H "Content-Type: application/json" ^
-d "{\"from\": \"+27123456789\", \"message\": \"AR\", \"type\": \"text\"}"
echo.
echo.

echo 5. Testing Consent Revocation...
curl -X POST http://localhost:8080/api/webhook/aisensy ^
-H "Content-Type: application/json" ^
-d "{\"from\": \"+27123456789\", \"message\": \"STOP\", \"type\": \"text\"}"
echo.
echo.

echo Webhook testing complete!
pause