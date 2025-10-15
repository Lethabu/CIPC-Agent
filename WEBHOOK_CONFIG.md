# 🔗 AiSensy Webhook Configuration

## Production Webhook URL
```
https://cipcagent.co.za/api/webhook/aisensy
Method: POST
Content-Type: application/json
```

## Local Testing URL
```
http://localhost:8080/api/webhook/aisensy
Method: POST
Content-Type: application/json
```

## Expected Payload Format
```json
{
  "from": "+27123456789",
  "message": "hi",
  "type": "text",
  "messageId": "msg_123",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## Supported Commands
- `YES` / `CONSENT` - Grant POPIA consent
- `NO` / `STOP` / `REVOKE` - Revoke consent
- `HI` / `HELLO` / `START` - Welcome message
- `SCORE` / `STATUS` - Check compliance score
- `AR` / `ANNUAL RETURN` - Annual Return services

## Test Commands
```bash
# Test welcome message
curl -X POST http://localhost:8080/api/webhook/aisensy \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "hi", "type": "text"}'

# Test consent
curl -X POST http://localhost:8080/api/webhook/aisensy \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "YES", "type": "text"}'

# Test compliance score
curl -X POST http://localhost:8080/api/webhook/aisensy \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "score", "type": "text"}'

# Test service request
curl -X POST http://localhost:8080/api/webhook/aisensy \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "AR", "type": "text"}'
```

## AiSensy Dashboard Setup
1. Login to AiSensy dashboard
2. Go to Settings > Webhooks
3. Add webhook URL: `https://cipcagent.co.za/api/webhook/aisensy`
4. Select events: Message Received
5. Add webhook secret (optional but recommended)
6. Save configuration

## Environment Variables Required
```bash
AISENSY_API_KEY=your_api_key_here
AISENSY_WEBHOOK_SECRET=your_webhook_secret_here  # Optional
AISENSY_WHATSAPP_NUMBER=wa.aisensy.com/+27699171527
WHATSAPP_NUMBER=+27699171527
```

## Status: ✅ CONFIGURED AND READY