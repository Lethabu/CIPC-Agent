#!/bin/bash

echo "🚀 CIPC Agent Production Deployment"
echo "=================================="

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ Do not run this script as root"
   exit 1
fi

# Set environment
export NODE_ENV=production

# Check required environment variables
required_vars=("DATABASE_URL" "AISENSY_API_KEY" "PAYFAST_MERCHANT_ID" "SESSION_SECRET")
for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "❌ Missing required environment variable: $var"
    exit 1
  fi
done

echo "✅ Environment variables validated"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Run database migrations
echo "🗄️ Running database migrations..."
if command -v psql &> /dev/null; then
    psql $DATABASE_URL -f scripts/migrate-db.sql
else
    echo "⚠️ PostgreSQL client not found. Run migrations manually:"
    echo "psql \$DATABASE_URL -f scripts/migrate-db.sql"
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Test database connection
echo "🔍 Testing database connection..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Database connection successful');
  pool.end();
});
"

# Test WhatsApp API
echo "🔍 Testing WhatsApp API..."
curl -s -f -H "X-API-Key: $AISENSY_API_KEY" \
  "$AISENSY_API_URL/status" > /dev/null && \
  echo "✅ WhatsApp API connection successful" || \
  echo "⚠️ WhatsApp API connection failed"

# Start application with PM2
echo "🚀 Starting application..."
if command -v pm2 &> /dev/null; then
    pm2 start ecosystem.config.js --env production
    pm2 save
    echo "✅ Application started with PM2"
else
    echo "⚠️ PM2 not found. Starting with node..."
    nohup node dist/app.js > logs/app.log 2>&1 &
    echo $! > cipc-agent.pid
    echo "✅ Application started (PID: $(cat cipc-agent.pid))"
fi

# Verify application is running
sleep 5
if curl -s -f http://localhost:3000/health > /dev/null; then
    echo "✅ Application health check passed"
else
    echo "❌ Application health check failed"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Application Status:"
echo "  • URL: http://localhost:3000"
echo "  • Environment: $NODE_ENV"
echo "  • Database: Connected"
echo "  • WhatsApp: Configured"
echo ""
echo "📝 Next Steps:"
echo "  1. Configure reverse proxy (nginx)"
echo "  2. Set up SSL certificates"
echo "  3. Configure monitoring"
echo "  4. Test WhatsApp webhook"
echo ""
echo "🔗 Webhook URLs:"
echo "  • WhatsApp: https://your-domain.com/webhook/whatsapp"
echo "  • Payment: https://your-domain.com/webhook/payment"