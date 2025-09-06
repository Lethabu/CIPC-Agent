#!/bin/bash

echo "🚀 Deploying Week 6 Revenue Systematization Features..."

# Set environment variables
export NODE_ENV=production
export DATABASE_URL=${DATABASE_URL:-"postgresql://localhost:5432/cipc_agent"}

# Run database migrations
echo "📊 Running database migrations..."
npm run db:migrate

# Build the application
echo "🔨 Building application..."
npm run build

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Start services
echo "🎯 Starting services..."

# Start the main server
pm2 start server/app.ts --name "cipc-agent-server" --interpreter ts-node

# Start the upgrade detection service
pm2 start -f --name "upgrade-detector" --interpreter ts-node << 'EOF'
import UpgradeDetectionService from './server/services/upgradeDetectionService.js';

const upgradeService = new UpgradeDetectionService();

// Run every hour
setInterval(async () => {
  try {
    await upgradeService.checkForUpgradeOpportunities();
  } catch (error) {
    console.error('Upgrade detection error:', error);
  }
}, 60 * 60 * 1000);

console.log('🔍 Upgrade detection service started');
EOF

# Verify deployment
echo "✅ Verifying deployment..."

# Check if server is responding
sleep 5
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "✅ Server is running"
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

echo "🎉 Week 6 deployment complete!"
echo ""
echo "📋 New Features Deployed:"
echo "  • Partner Dashboard API"
echo "  • Subscription Management"
echo "  • Self-Service Plan Management"
echo "  • Automated Upgrade Detection"
echo "  • Partner Pitch Materials"
echo ""
echo "🔗 Access Points:"
echo "  • Partner Registration: https://cipcagent.co.za/api/partners/register"
echo "  • Plan Management: https://cipcagent.co.za/api/manage-plan"
echo "  • Partner Dashboard: https://cipcagent.co.za/partners/dashboard"
echo ""
echo "📊 Next Steps:"
echo "  1. Test partner registration flow"
echo "  2. Verify subscription upgrade paths"
echo "  3. Monitor upgrade detection logs"
echo "  4. Begin partner outreach campaign"