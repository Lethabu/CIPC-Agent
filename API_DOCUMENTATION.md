# CIPC Agent Platform API Documentation

## Overview

The CIPC Agent Platform provides a comprehensive API for automating CIPC compliance processes through WhatsApp integration, PAYG services, and subscription management.

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

Most endpoints require the `INTERNAL_API_KEY` header for internal service communication:
```
X-Internal-API-Key: your-internal-api-key
```

---

## WhatsApp Integration

### Inbound Message Handler
Process incoming WhatsApp messages and trigger appropriate responses.

**Endpoint:** `POST /api/whatsapp/inbound`

**Request Body:**
```json
{
  "from": "+27123456789",
  "message": "hi"
}
```

**Response:**
```json
{
  "success": true
}
```

**Supported Commands:**
- `hi`, `hello`, `start` - Welcome message
- `score` - Get compliance score
- `AR` - Annual Return filing (R199)
- `BO` - Beneficial Ownership filing (R99)
- `DA` - Director Amendment (R149)
- `BBEE` - B-BBEE Certificate (R199)
- `AFS` - Annual Financial Statements (R249)
- `growth` - Upgrade to Growth plan (R899/mo)
- `enterprise` - Upgrade to Enterprise plan (R2999/mo)
- Company registration number (10+ digits) - Register company for monitoring

---

## Payment Processing

### PayFast Webhook
Handle payment confirmations from PayFast.

**Endpoint:** `POST /api/payments/payfast/webhook`

**Request Body:**
```json
{
  "payment_status": "COMPLETE",
  "custom_str1": "transaction-uuid",
  "amount_gross": "199.00",
  "signature": "payfast-signature"
}
```

### Subscription Webhook
Handle subscription status updates.

**Endpoint:** `POST /api/payments/subscription/webhook`

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "tier": "growth",
  "status": "active"
}
```

---

## User Management

### Get User Profile
**Endpoint:** `GET /api/users/{userId}`

**Response:**
```json
{
  "id": "uuid",
  "phoneNumber": "+27123456789",
  "fullName": "John Doe",
  "companyRegNumber": "2020123456",
  "subscriptionTier": "growth",
  "subscriptionStatus": "active",
  "totalSpent": "1299.00",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Update User
**Endpoint:** `PUT /api/users/{userId}`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "companyRegNumber": "2020123456"
}
```

---

## Compliance Management

### Get Compliance Score
**Endpoint:** `GET /api/compliance/score/{userId}`

**Response:**
```json
{
  "score": 85,
  "issues": [
    {
      "type": "upcoming",
      "description": "Annual Return due in 14 days",
      "severity": "medium",
      "action": "File now: R199"
    }
  ]
}
```

### Get Upcoming Deadlines
**Endpoint:** `GET /api/compliance/deadlines/{userId}`

**Response:**
```json
{
  "deadlines": [
    {
      "id": "uuid",
      "deadlineType": "annual_return",
      "dueDate": "2024-03-15T00:00:00Z",
      "status": "pending",
      "daysUntilDue": 14
    }
  ]
}
```

---

## Lead Management

### Get Lead Scout Results
**Endpoint:** `GET /api/leads/scout-results`

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `minScore` (optional): Minimum lead score (default: 70)

**Response:**
```json
{
  "leads": [
    {
      "id": "uuid",
      "platform": "twitter",
      "content": "Struggling with CIPC compliance...",
      "authorHandle": "@business_owner",
      "leadScore": 85,
      "extractedCompanyInfo": {
        "companyName": "Example Business",
        "industry": "retail",
        "urgency": "high"
      },
      "conversionStatus": "pending"
    }
  ]
}
```

### Generate Outreach Message
**Endpoint:** `POST /api/leads/{leadId}/outreach`

**Response:**
```json
{
  "message": "Hi! Saw your post about CIPC struggles. Get your free compliance score in 30 seconds: wa.me/27123456789"
}
```

---

## Content Management

### Generate TikTok Content
**Endpoint:** `POST /api/content/tiktok/generate`

**Request Body:**
```json
{
  "pillar": "FEAR",
  "topic": "R50,000 penalty for missing BO deadline",
  "days": 7
}
```

**Response:**
```json
{
  "calendar": [
    {
      "date": "2024-01-01T00:00:00Z",
      "pillar": "FEAR",
      "topic": "R50,000 penalty",
      "script": "Did you know missing your Beneficial Ownership deadline...",
      "hooks": ["This R50,000 mistake is bankrupting SMMEs"],
      "hashtags": ["#CIPC", "#SMME", "#Compliance"],
      "cta": "Get help: wa.me/27123456789"
    }
  ]
}
```

---

## Analytics & Reporting

### Platform Metrics
**Endpoint:** `GET /api/analytics/metrics`

**Response:**
```json
{
  "totalUsers": 1250,
  "activeSubscriptions": 89,
  "paygTransactions": 456,
  "totalRevenue": "125000.00",
  "conversionRate": 2.3,
  "averageOrderValue": "274.00"
}
```

### TikTok Performance
**Endpoint:** `GET /api/analytics/tiktok`

**Response:**
```json
{
  "totalVideos": 30,
  "totalViews": 250000,
  "totalEngagement": 15000,
  "conversionRate": 2.1,
  "topPerformingPillar": "FEAR",
  "recommendations": [
    "Increase FEAR content by 20%",
    "Post between 6-8 PM"
  ]
}
```

---

## Health & Status

### Health Check
**Endpoint:** `GET /healthz`

**Response:**
```json
{
  "ok": true,
  "database": true,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Service Status
**Endpoint:** `GET /api/status`

**Response:**
```json
{
  "services": {
    "database": "healthy",
    "temporal": "healthy",
    "whatsapp": "healthy",
    "payments": "healthy"
  },
  "agents": {
    "leadScout": "active",
    "deadlineSentinel": "active"
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Common Error Codes:**
- `INVALID_REQUEST` - Malformed request
- `UNAUTHORIZED` - Missing or invalid API key
- `NOT_FOUND` - Resource not found
- `PAYMENT_FAILED` - Payment processing error
- `COMPLIANCE_ERROR` - CIPC validation failed
- `RATE_LIMITED` - Too many requests

---

## Rate Limits

- WhatsApp endpoints: 100 requests/minute per phone number
- Payment endpoints: 10 requests/minute per user
- Analytics endpoints: 60 requests/minute
- General API: 1000 requests/hour per API key

---

## Webhooks

### WhatsApp Webhook Configuration
Configure your WhatsApp provider to send messages to:
```
POST https://your-domain.com/api/whatsapp/inbound
```

### Payment Webhook Configuration
Configure PayFast to send notifications to:
```
POST https://your-domain.com/api/payments/payfast/webhook
```

---

## Testing

### Test WhatsApp Bot
```bash
curl -X POST http://localhost:3000/api/whatsapp/inbound \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "score"}'
```

### Test Payment Webhook
```bash
curl -X POST http://localhost:3000/api/payments/payfast/webhook \
-H "Content-Type: application/json" \
-d '{"payment_status": "COMPLETE", "custom_str1": "test-transaction"}'
```