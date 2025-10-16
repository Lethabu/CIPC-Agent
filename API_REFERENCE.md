# CIPC-Agent API Reference

## Typebot Webhooks

### POST /webhooks/typebot/onboarding
Handles company onboarding flow from Typebot.

**Request:**
```json
{
  "sessionId": "session_123",
  "userId": "user_456", 
  "variables": {
    "companyId": "comp_789",
    "company_name": "Tech Innovations PTY",
    "business_type": "PTY"
  }
}
```

### POST /webhooks/typebot/filing
Processes filing requests from Typebot.

**Request:**
```json
{
  "sessionId": "session_123",
  "variables": {
    "companyId": "comp_789",
    "filingType": "annual_return",
    "financial_year_end": "2024-02-28"
  }
}
```

### POST /webhooks/typebot/support
Handles support queries from Typebot.

**Request:**
```json
{
  "sessionId": "session_123",
  "userId": "user_456",
  "message": "When is my next deadline?"
}
```

## AI Agent APIs

### POST /api/agents/onboarding
Process onboarding user input.

**Request:**
```json
{
  "input": "Tech Innovations PTY LTD",
  "context": {
    "currentStep": "company_name",
    "sessionId": "session_123"
  }
}
```

**Response:**
```json
{
  "message": "What type of business? (PTY/CC/NPC)",
  "nextStep": "business_type",
  "data": {
    "company_name": "Tech Innovations PTY LTD"
  }
}
```

### POST /api/agents/filing
Submit filing request.

**Request:**
```json
{
  "companyId": "comp_789",
  "type": "annual_return",
  "data": {
    "financial_year_end": "2024-02-28",
    "turnover": 1000000,
    "assets": 500000
  }
}
```

### GET /api/agents/deadlines/:companyId
Get compliance deadlines and alerts.

**Response:**
```json
[
  {
    "type": "warning",
    "message": "Annual Return due in 15 days",
    "action": "prepare_documents"
  }
]
```

### POST /api/agents/support
Process support query.

**Request:**
```json
{
  "message": "How do I file my annual return?",
  "userId": "user_456"
}
```

**Response:**
```json
{
  "response": "I can help you file annual returns...",
  "actions": ["start_filing", "view_history"],
  "confidence": 0.8
}
```

## Health Check

### GET /health
Check service status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```