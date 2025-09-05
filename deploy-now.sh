#!/bin/bash

echo "🚀 CIPC AGENT - IMMEDIATE DEPLOYMENT"
echo "===================================="

# 1. Deploy Landing Page to Vercel
echo "📱 Deploying landing page..."
cd client
npm install
npm run build
npx vercel --prod --yes
cd ..

# 2. Test webhook locally
echo "🔗 Starting webhook..."
node webhook.js &
WEBHOOK_PID=$!

sleep 3

# 3. Test the webhook
echo "🧪 Testing webhook..."
curl -X POST http://localhost:3000/webhook \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "hi", "type": "text"}'

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "📱 Landing Page: Check Vercel output above"
echo "🔗 Webhook: http://localhost:3000/webhook"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Update WhatsApp number in client/src/App.tsx"
echo "2. Configure AiSensy webhook to your server"
echo "3. Start outreach to your 50-lead list"
echo ""
echo "💰 TARGET: 10 paying customers in 72 hours"

# Keep webhook running
wait $WEBHOOK_PID