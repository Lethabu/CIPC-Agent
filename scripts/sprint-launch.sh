#!/bin/bash

echo "🚀 CIPC Agent 72-Hour Sprint Launch"
echo "=================================="

# Check prerequisites
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from template..."
    cp .env.example .env
    echo "⚠️  CRITICAL: Update .env with your AISENSY_API_KEY before continuing!"
    echo "   Get your key from: https://aisensy.com/dashboard"
    exit 1
fi

# Verify critical environment variables
source .env
if [ -z "$AISENSY_API_KEY" ] || [ "$AISENSY_API_KEY" = "your-aisensy-api-key" ]; then
    echo "❌ AISENSY_API_KEY not configured in .env"
    echo "   This is required for WhatsApp integration"
    exit 1
fi

echo "✅ Environment configured"

# Start sprint services
echo "🔨 Starting sprint services..."
docker-compose -f docker-compose.sprint.yml up -d --build

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Health checks
echo "🏥 Checking service health..."

if curl -s http://localhost:3000/healthz > /dev/null; then
    echo "✅ API server ready"
else
    echo "❌ API server not responding"
    exit 1
fi

if docker-compose -f docker-compose.sprint.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database ready"
else
    echo "❌ Database not ready"
    exit 1
fi

echo ""
echo "🎉 SPRINT PLATFORM IS LIVE!"
echo "=========================="
echo ""
echo "📱 WhatsApp Webhook URL:"
echo "   http://localhost:3000/api/sprint/webhook"
echo ""
echo "🧪 Test the bot:"
echo "   curl -X POST http://localhost:3000/api/sprint/webhook \\"
echo "   -H \"Content-Type: application/json\" \\"
echo "   -d '{\"from\": \"+27123456789\", \"message\": \"hi\", \"type\": \"text\"}'"
echo ""
echo "📊 Sprint Dashboard:"
echo "   http://localhost:3000/api/sprint/dashboard"
echo ""
echo "🔧 Manual Filing Endpoint:"
echo "   POST http://localhost:3000/api/sprint/manual-filing"
echo "   Body: {\"phoneNumber\": \"+27123456789\", \"serviceType\": \"Annual Return\", \"amount\": 199}"
echo ""
echo "📋 SPRINT CHECKLIST:"
echo "   [ ] Configure AiSensy webhook to point to your server"
echo "   [ ] Test WhatsApp flow with real number"
echo "   [ ] Prepare manual filing process"
echo "   [ ] Set up payment links (PayFast/manual)"
echo "   [ ] Begin outreach to first 50 leads"
echo ""
echo "🎯 SPRINT GOALS:"
echo "   • Day 1: Live funnel + first demos"
echo "   • Day 2: First manual filings"
echo "   • Day 3: 10 paying customers"
echo ""
echo "📞 Support: Check logs with 'docker-compose -f docker-compose.sprint.yml logs -f'"