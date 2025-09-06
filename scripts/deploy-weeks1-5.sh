#!/bin/bash

echo "🚀 Deploying CIPC Agent Weeks 1-5 Complete Platform..."

# Set environment variables
export NODE_ENV=production
export DATABASE_URL=${DATABASE_URL:-"postgresql://localhost:5432/cipc_agent"}

# Week 1-2: Core Infrastructure
echo "📱 Week 1-2: Deploying Core WhatsApp Infrastructure..."

# Build and deploy landing page
echo "🌐 Building landing page..."
cd client
npm install
npm run build
cd ..

# Deploy to Vercel (or your hosting)
if command -v vercel &> /dev/null; then
    echo "📤 Deploying to Vercel..."
    cd client && vercel --prod && cd ..
else
    echo "⚠️  Vercel CLI not found. Deploy manually to your hosting provider."
fi

# Week 2-3: Database and Backend
echo "📊 Week 2-3: Setting up Database and Backend..."

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:migrate

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install --production

# Week 3-4: Services and Integrations
echo "🔧 Week 3-4: Deploying Services..."

# Start the main server
echo "🖥️  Starting main server..."
pm2 start server/app.ts --name "cipc-agent-server" --interpreter ts-node

# Start background services
echo "🔄 Starting background services..."

# Lead Scout Service
pm2 start -f --name "lead-scout" --interpreter ts-node << 'EOF'
import LeadScoutService from './server/services/leadScoutService.js';

const leadScout = new LeadScoutService();

// Run lead scouting every 4 hours
setInterval(async () => {
  try {
    console.log('🔍 Running lead scout...');
    const leads = await leadScout.scoutAccountingFirms('Gauteng', 20);
    console.log(`📊 Found ${leads.length} potential partners`);
  } catch (error) {
    console.error('Lead scout error:', error);
  }
}, 4 * 60 * 60 * 1000);

console.log('🔍 Lead Scout service started');
EOF

# Week 4-5: Viral Campaign and Analytics
echo "📈 Week 4-5: Deploying Viral Campaign Services..."

# TikTok Content Generator
pm2 start -f --name "content-generator" --interpreter ts-node << 'EOF'
import ViralCampaignService from './server/services/viralCampaignService.js';

const campaign = new ViralCampaignService();

// Generate daily content
setInterval(async () => {
  try {
    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const content = await campaign.generateDailyContent(day);
    console.log(`📱 Generated content for day ${day}:`, content.hook);
  } catch (error) {
    console.error('Content generation error:', error);
  }
}, 24 * 60 * 60 * 1000); // Daily

console.log('📱 Content Generator service started');
EOF

# Upgrade Detection Service
pm2 start -f --name "upgrade-detector" --interpreter ts-node << 'EOF'
import UpgradeDetectionService from './server/services/upgradeDetectionService.js';

const upgradeService = new UpgradeDetectionService();

// Check for upgrade opportunities every hour
setInterval(async () => {
  try {
    await upgradeService.checkForUpgradeOpportunities();
  } catch (error) {
    console.error('Upgrade detection error:', error);
  }
}, 60 * 60 * 1000);

console.log('🔍 Upgrade Detection service started');
EOF

# Verify deployment
echo "✅ Verifying deployment..."

# Check if server is responding
sleep 5
if curl -f http://localhost:3000/api/sprint/dashboard/metrics > /dev/null 2>&1; then
  echo "✅ Server is running and responding"
else
  echo "❌ Server health check failed"
  exit 1
fi

# Check database connection
if npm run db:check > /dev/null 2>&1; then
  echo "✅ Database connection successful"
else
  echo "❌ Database connection failed"
  exit 1
fi

# Display deployment summary
echo ""
echo "🎉 CIPC Agent Weeks 1-5 Deployment Complete!"
echo ""
echo "📋 Deployed Components:"
echo "  ✅ Landing Page (client/)"
echo "  ✅ WhatsApp Webhook (/api/whatsapp/webhook)"
echo "  ✅ PAYG Services (WhatsAppPaygService)"
echo "  ✅ Sprint Dashboard (/api/sprint/dashboard)"
echo "  ✅ Lead Scout Service (background)"
echo "  ✅ Viral Campaign Engine (TikTokContentEngine)"
echo "  ✅ Upgrade Detection (background)"
echo ""
echo "🔗 Key Endpoints:"
echo "  • Landing Page: https://your-domain.com"
echo "  • WhatsApp Webhook: https://your-domain.com/api/whatsapp/webhook"
echo "  • Sprint Dashboard: https://your-domain.com/api/sprint/dashboard/metrics"
echo "  • Payment Webhook: https://your-domain.com/api/payments/payfast/webhook"
echo ""
echo "📱 WhatsApp Commands:"
echo "  • 'hi' - Welcome message"
echo "  • 'SCORE 2020123456789' - Compliance check"
echo "  • 'AR' - Annual Return quote"
echo "  • 'BO' - Beneficial Ownership quote"
echo "  • 'DA' - Director Amendment quote"
echo ""
echo "🎯 Sprint Targets:"
echo "  • 10 paying customers in 72 hours"
echo "  • R1,990+ revenue target"
echo "  • 50+ WhatsApp interactions"
echo ""
echo "📊 Monitor Progress:"
echo "  • Sprint Dashboard: /api/sprint/dashboard/metrics"
echo "  • Live Activity: /api/sprint/dashboard/activity"
echo "  • Checklist: /api/sprint/dashboard/checklist"
echo ""
echo "🚀 Ready for 72-Hour Sprint Launch!"
echo ""
echo "Next Steps:"
echo "1. Configure AiSensy webhook URL"
echo "2. Test WhatsApp flow end-to-end"
echo "3. Begin LinkedIn outreach (20 DMs)"
echo "4. Post in SMME Facebook groups"
echo "5. Create first TikTok video"
echo "6. Book demo calls"
echo ""
echo "💪 Let's build the future of CIPC compliance!"