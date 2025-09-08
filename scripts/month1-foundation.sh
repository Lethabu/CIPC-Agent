#!/bin/bash

# Month 1: Foundation & Metrics Infrastructure
# This script sets up the core analytics and tracking systems

set -e

echo "🚀 Starting Month 1: Foundation & Metrics Infrastructure"

# 1. Run database migrations
echo "📊 Setting up analytics database schema..."
psql $DATABASE_URL -f migrations/0003_month1_analytics_schema.sql

# 2. Install additional dependencies for analytics
echo "📦 Installing analytics dependencies..."
npm install --save @temporalio/client@latest pino-elasticsearch grafana-api-client

# 3. Set up Grafana dashboard configuration
mkdir -p monitoring/grafana/dashboards
cat > monitoring/grafana/dashboards/north-star-metrics.json << 'EOF'
{
  "dashboard": {
    "title": "CIPC Agent - North Star Metrics",
    "panels": [
      {
        "title": "Weekly Automated Filings",
        "type": "stat",
        "targets": [
          {
            "rawSql": "SELECT COUNT(*) FROM automated_filings WHERE created_at >= NOW() - INTERVAL '7 days' AND automation_level = 'fully_automated'"
          }
        ]
      },
      {
        "title": "LTV/CAC Ratio",
        "type": "stat",
        "targets": [
          {
            "rawSql": "SELECT AVG(CASE WHEN metric_name = 'customer_lifetime_value' THEN metric_value END) / AVG(CASE WHEN metric_name = 'customer_acquisition_cost' THEN metric_value END) as ratio FROM business_metrics WHERE period_start >= NOW() - INTERVAL '30 days'"
          }
        ]
      },
      {
        "title": "Monthly Recurring Revenue",
        "type": "graph",
        "targets": [
          {
            "rawSql": "SELECT DATE_TRUNC('day', created_at) as time, SUM(amount) as mrr FROM payg_transactions WHERE status = 'paid' GROUP BY time ORDER BY time"
          }
        ]
      }
    ]
  }
}
EOF

# 4. Create monitoring docker-compose override
cat > docker-compose.monitoring.yml << 'EOF'
version: '3.8'
services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
      - grafana_data:/var/lib/grafana
    networks:
      - cipc-network

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - cipc-network

volumes:
  grafana_data:
EOF

# 5. Create Prometheus configuration
mkdir -p monitoring
cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'cipc-agent-node'
    static_configs:
      - targets: ['node-server:3000']
  
  - job_name: 'cipc-agent-temporal'
    static_configs:
      - targets: ['temporal:7233']
EOF

# 6. Update main docker-compose to include metrics route
echo "🔧 Updating server configuration..."

# Add metrics route to app.ts if not already present
if ! grep -q "metrics" server/app.ts; then
    sed -i '/import healthRoutes/a import metricsRoutes from "./routes/metrics.js";' server/app.ts
    sed -i '/app.use("\/", healthRoutes);/a app.use("/api/metrics", metricsRoutes);' server/app.ts
fi

# 7. Create the Month 1 checklist
cat > MONTH1_CHECKLIST.md << 'EOF'
# Month 1: Foundation & Metrics Infrastructure ✅

## Week 1-2: Analytics Foundation
- [x] Database schema for metrics tracking
- [x] MetricsService implementation
- [x] Compliance Copilot workflow
- [x] North Star metrics API endpoints
- [ ] Grafana dashboard setup
- [ ] Prometheus monitoring

## Week 3-4: Compliance Health Score
- [x] Compliance scoring algorithm
- [x] Automated compliance checks
- [x] WhatsApp alert system
- [ ] User dashboard integration
- [ ] Mobile app compliance widget

## Key Metrics to Track:
1. **Weekly Automated Filings**: Target 50+ by end of month
2. **LTV/CAC Ratio**: Target 3:1 minimum
3. **Compliance Health Scores**: Average 75+ across users
4. **User Engagement**: Daily active users growth

## Success Criteria:
- [ ] All metrics tracking systems operational
- [ ] Compliance Copilot running daily for all users
- [ ] Dashboard showing real-time North Star metrics
- [ ] At least 100 compliance health scores calculated
- [ ] WhatsApp alerts sent for 20+ users

## Next Month Preview:
Month 2 will focus on Lead Scout implementation and viral growth mechanics.
EOF

echo "✅ Month 1 foundation setup complete!"
echo "📊 Access Grafana dashboard at: http://localhost:3001 (admin/admin)"
echo "📈 Prometheus metrics at: http://localhost:9090"
echo "🎯 North Star metrics API: http://localhost:3000/api/metrics/dashboard"

# Start the enhanced monitoring stack
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

echo "🎉 Month 1 infrastructure is now live!"
echo "📋 Check MONTH1_CHECKLIST.md for progress tracking"