# 🚀 CIPC-Agent Setup Instructions

## ⚡ Quick Start (5 minutes)

### 1. **Start All Services**
```bash
# Run this command:
quick-start.bat
```

### 2. **Test WhatsApp Integration**
```bash
# Test compliance check:
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d "{\"from\":\"+27123456789\",\"message\":\"SCORE 2020/123456/07\",\"type\":\"text\"}"
```

### 3. **Expected Response**
```json
{
  "success": true,
  "response": "📊 *CIPC Compliance Score: 85/100*\n\n⚠️ *Issues Found:*\n1. *Annual Return* - Overdue\n   💰 R199 - Reply \"AR\"\n\n📅 *Next Deadline:* March 15, 2025"
}
```

## 🔧 Production Configuration

### **Required API Keys**
1. **CIPC Portal Access**
   - Username: `your_cipc_username`
   - Password: `your_cipc_password`
   - Register at: https://eservices.cipc.co.za/

2. **AiSensy WhatsApp**
   - API Key: Get from https://app.aisensy.com/
   - Webhook URL: `http://your-domain.com:3001/webhook`

3. **PayFast Payment**
   - Merchant ID: Get from https://www.payfast.co.za/
   - Merchant Key: From PayFast dashboard
   - Passphrase: Set in PayFast settings

### **Environment Setup**
```bash
# Copy production template:
copy .env.production .env

# Edit .env with your credentials:
CIPC_USERNAME=your_cipc_username
CIPC_PASSWORD=your_cipc_password
AISENSY_API_KEY=your_aisensy_key
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
```

## 📱 AiSensy Configuration

### **Webhook Setup**
1. Login to AiSensy dashboard
2. Go to Settings → Webhooks
3. Set URL: `http://your-domain.com:3001/webhook`
4. Enable "Message Received" events
5. Test with: "SCORE 2020/123456/07"

### **Expected Flow**
```
User: "Hi"
Bot: "🏢 Welcome to CIPC Agent! Reply 'SCORE' + company reg number"

User: "SCORE 2020/123456/07"  
Bot: "📊 CIPC Compliance Score: 85/100 ⚠️ Issues Found..."

User: "AR"
Bot: "💼 Annual Return Filing 💰 Price: R199 🔗 Pay now: [PayFast Link]"
```

## 🎯 Business Metrics

### **Revenue Targets**
- **Week 1**: 10 compliance checks, 2 filings = R400
- **Month 1**: 500 checks, 100 filings = R20,000  
- **Month 3**: 2,000 checks, 500 filings = R100,000

### **Key Features Working**
✅ Real-time compliance scoring
✅ WhatsApp conversational interface  
✅ PayFast payment integration
✅ CIPC portal automation (with credentials)
✅ Automated deadline calculations

## 🚨 Troubleshooting

### **Common Issues**
1. **Port 3001 in use**: Kill process with `taskkill /PID [PID] /F`
2. **Python errors**: Run `python -m pip install playwright && python -m playwright install`
3. **CIPC timeout**: Check credentials in .env file
4. **Webhook not responding**: Ensure firewall allows port 3001

### **Health Checks**
```bash
# Test webhook:
curl http://localhost:3001/health

# Test server:  
curl http://localhost:8080/health

# Test client:
curl http://localhost:3000
```

## 🎉 Success Indicators

✅ Webhook responds to compliance requests
✅ CIPC runner connects to portal (with credentials)
✅ PayFast links generate correctly
✅ WhatsApp bot provides intelligent responses
✅ All services start without errors

**Your CIPC-Agent platform is now production-ready!** 🚀