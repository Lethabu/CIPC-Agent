# 🚀 CIPC Agent Army - Production Deployment Guide

## Quick Start

1. **Environment Setup**
   ```bash
   cp .env.example .env
   # Fill in your actual credentials
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## 📱 WhatsApp Integration

### Twilio Setup
1. Create Twilio account
2. Get WhatsApp Business API access
3. Configure webhook: `https://yourdomain.com/whatsapp/webhook`
4. Add environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

### Test WhatsApp Flow
Send to your WhatsApp number:
- "Hi" → Onboarding flow
- Upload ID photo → Document processing
- "Status" → Compliance check
- "File" → Annual return preparation

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
vercel --prod
```

### Railway
```bash
railway login
railway init
railway up
```

### AWS Lambda
Use the included `vercel.json` configuration.

## 💰 Payment Integration

### PayFast Setup
1. Register merchant account
2. Add credentials to `.env`:
   - `PAYFAST_MERCHANT_ID`
   - `PAYFAST_MERCHANT_KEY`
   - `PAYFAST_PASSPHRASE`

## 🔒 Security Checklist

- [ ] POPIA compliance implemented
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Input validation active
- [ ] Error logging setup

## 📊 Monitoring

### Required Services
- **Error Tracking**: Sentry
- **Analytics**: PostHog
- **Uptime**: Pingdom
- **Logs**: LogRocket

## 🎯 Go-Live Checklist

- [ ] Domain configured
- [ ] SSL certificate active
- [ ] WhatsApp webhook verified
- [ ] Payment gateway tested
- [ ] Database migrations run
- [ ] Monitoring alerts setup
- [ ] Backup strategy implemented

## 📈 Scaling Strategy

1. **Phase 1**: Single server (0-100 users)
2. **Phase 2**: Load balancer + Redis (100-1000 users)
3. **Phase 3**: Microservices + Queue system (1000+ users)

## 🆘 Support

- WhatsApp: +27 82 555 1234
- Email: support@cipcagentarmy.co.za
- Docs: https://docs.cipcagentarmy.co.za