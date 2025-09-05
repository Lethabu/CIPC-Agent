# 🔗 AiSensy Webhook Configuration

## Production Webhook URL
```
https://your-domain.com/webhook
Method: POST
Content-Type: application/json
```

## Local Testing URL
```
http://localhost:3001/webhook
Method: POST
Content-Type: application/json
```

## Expected Payload Format
```json
{
  "from": "+27123456789",
  "message": "hi",
  "type": "text"
}
```

## Test Commands
```bash
# Test welcome message
curl -X POST http://localhost:3001/webhook \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "hi", "type": "text"}'

# Test compliance score
curl -X POST http://localhost:3001/webhook \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "score", "type": "text"}'

# Test service request
curl -X POST http://localhost:3001/webhook \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "AR", "type": "text"}'
```

## AiSensy Dashboard Setup
1. Login to AiSensy dashboard
2. Go to Settings > Webhooks
3. Add webhook URL: `https://your-domain.com/webhook`
4. Select events: Message Received
5. Save configuration

## Status: READY FOR CONFIGURATION