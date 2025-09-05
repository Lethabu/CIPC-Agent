# CIPC Agent Platform - Production Deployment Guide

## 🚀 Quick Start (Development)

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd CIPC-Agent
   cp .env.example .env
   # Update .env with your API keys
   ```

2. **Start Platform**
   ```bash
   ./scripts/start-platform.sh
   ```

3. **Test WhatsApp Bot**
   ```bash
   curl -X POST http://localhost:3000/api/whatsapp/inbound \
   -H "Content-Type: application/json" \
   -d '{"from": "+27123456789", "message": "hi"}'
   ```

---

## 🏗️ Production Deployment

### Prerequisites

- Docker & Docker Compose
- Domain name with SSL certificate
- PostgreSQL database (managed service recommended)
- Redis instance
- WhatsApp Business API access
- PayFast merchant account
- OpenAI API key

### 1. Infrastructure Setup

**Option A: Cloud Provider (Recommended)**
- AWS ECS/Fargate + RDS + ElastiCache
- Google Cloud Run + Cloud SQL + Memorystore
- Azure Container Instances + PostgreSQL + Redis Cache

**Option B: VPS/Dedicated Server**
- Ubuntu 22.04 LTS
- 4GB+ RAM, 2+ CPU cores
- 50GB+ SSD storage

### 2. Environment Configuration

Create production `.env`:
```bash
# Core Configuration
NODE_ENV=production
NODE_PORT=3000
INTERNAL_API_KEY=your-super-secure-key-here

# Database (use managed service)
DATABASE_URL=postgresql://user:pass@your-db-host:5432/cipc_agent

# Redis (use managed service)
REDIS_URL=redis://your-redis-host:6379

# Temporal
TEMPORAL_ADDRESS=your-temporal-host:7233

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# WhatsApp/AiSensy
AISENSY_API_KEY=your-aisensy-key
AISENSY_BASE_URL=https://backend.aisensy.com

# PayFast (Production)
PAYFAST_MERCHANT_ID=your-merchant-id
PAYFAST_MERCHANT_KEY=your-merchant-key
PAYFAST_PASSPHRASE=your-passphrase
PAYFAST_SANDBOX=false

# URLs
BASE_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com

# Security
JWT_SECRET=your-jwt-secret-32-chars-min
ENCRYPTION_KEY=your-32-character-encryption-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# CORS
CORS_ORIGIN=https://your-domain.com
```

### 3. Database Setup

**Run migrations:**
```bash
# Connect to your PostgreSQL instance
psql $DATABASE_URL -f migrations/0001_cipc_agent_schema.sql
```

**Verify tables:**
```sql
\dt
-- Should show: users, payg_transactions, compliance_deadlines, lead_scout_results, pricing_config
```

### 4. SSL Certificate

**Using Let's Encrypt:**
```bash
sudo apt install certbot nginx
sudo certbot --nginx -d your-domain.com
```

**Nginx Configuration:**
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. Production Docker Compose

Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  node-server:
    build:
      context: .
      dockerfile: Dockerfile.node
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  go-worker:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    restart: unless-stopped
    depends_on:
      - node-server

networks:
  default:
    external:
      name: cipc-network
```

### 6. Deploy Application

```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
curl https://your-domain.com/healthz
```

---

## 🔧 WhatsApp Integration Setup

### 1. AiSensy Configuration

1. **Create AiSensy Account**
   - Sign up at https://aisensy.com
   - Get your API key from dashboard

2. **Configure Webhook**
   - Webhook URL: `https://your-domain.com/api/whatsapp/inbound`
   - Method: POST
   - Content-Type: application/json

3. **Test Integration**
   ```bash
   curl -X POST https://your-domain.com/api/whatsapp/inbound \
   -H "Content-Type: application/json" \
   -d '{"from": "+27123456789", "message": "test"}'
   ```

### 2. WhatsApp Business API (Alternative)

1. **Facebook Business Manager Setup**
2. **WhatsApp Business Account Verification**
3. **Webhook Configuration**
4. **Phone Number Verification**

---

## 💳 Payment Integration Setup

### 1. PayFast Configuration

1. **Create PayFast Account**
   - Business verification required
   - Get Merchant ID and Key

2. **Configure Webhooks**
   - ITN URL: `https://your-domain.com/api/payments/payfast/webhook`
   - Enable all notification types

3. **Test Payments**
   ```bash
   # Test webhook
   curl -X POST https://your-domain.com/api/payments/payfast/webhook \
   -H "Content-Type: application/json" \
   -d '{"payment_status": "COMPLETE", "custom_str1": "test-tx"}'
   ```

### 2. Subscription Management

Configure recurring billing:
- Monthly subscriptions for Growth/Enterprise tiers
- Automatic renewal handling
- Failed payment retry logic

---

## 🤖 AI Services Setup

### 1. OpenAI Configuration

1. **Get API Key**
   - Create account at https://openai.com
   - Generate API key with sufficient credits

2. **Configure Rate Limits**
   - Monitor usage in OpenAI dashboard
   - Set up billing alerts

### 2. Lead Scout Configuration

1. **Social Media APIs**
   - Twitter API v2 Bearer Token
   - LinkedIn API access (if needed)

2. **Content Monitoring**
   - Configure search keywords
   - Set up monitoring schedules

---

## 📊 Monitoring & Analytics

### 1. Application Monitoring

**Health Checks:**
```bash
# API Health
curl https://your-domain.com/healthz

# Database Health
curl https://your-domain.com/api/status
```

**Log Monitoring:**
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Specific service logs
docker-compose -f docker-compose.prod.yml logs -f node-server
```

### 2. Performance Monitoring

**Sentry Integration:**
- Error tracking and performance monitoring
- Real-time alerts for issues

**Custom Metrics:**
- User acquisition rates
- Conversion tracking
- Revenue analytics

### 3. Database Monitoring

**Key Metrics:**
- Connection pool usage
- Query performance
- Storage utilization

**Backup Strategy:**
```bash
# Daily backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Automated backup script
0 2 * * * /path/to/backup-script.sh
```

---

## 🔒 Security Checklist

### 1. API Security
- [x] Rate limiting implemented
- [x] Input validation on all endpoints
- [x] CORS properly configured
- [x] API keys secured in environment variables

### 2. Database Security
- [x] Connection encryption (SSL)
- [x] Restricted database access
- [x] Regular security updates
- [x] Backup encryption

### 3. Infrastructure Security
- [x] SSL certificates configured
- [x] Firewall rules in place
- [x] Regular security updates
- [x] Access logging enabled

---

## 🚨 Troubleshooting

### Common Issues

**1. WhatsApp Messages Not Processing**
```bash
# Check webhook configuration
curl -X POST https://your-domain.com/api/whatsapp/inbound \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "test"}'

# Check logs
docker-compose logs -f node-server
```

**2. Payment Webhooks Failing**
```bash
# Verify PayFast configuration
# Check webhook URL accessibility
# Validate signature verification
```

**3. Database Connection Issues**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check connection pool
docker-compose logs -f node-server | grep "database"
```

**4. High Memory Usage**
```bash
# Monitor container resources
docker stats

# Optimize database queries
# Implement caching strategies
```

### Performance Optimization

**1. Database Optimization**
- Index optimization
- Query performance tuning
- Connection pooling

**2. Caching Strategy**
- Redis for session storage
- API response caching
- Static asset caching

**3. Scaling Considerations**
- Horizontal scaling with load balancers
- Database read replicas
- CDN for static assets

---

## 📈 Growth & Scaling

### Phase 1: MVP (0-1K users)
- Single server deployment
- Basic monitoring
- Manual customer support

### Phase 2: Growth (1K-10K users)
- Load balancer setup
- Database optimization
- Automated monitoring

### Phase 3: Scale (10K+ users)
- Microservices architecture
- Multi-region deployment
- Advanced analytics

---

## 🆘 Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor application health
- Check error logs
- Verify payment processing

**Weekly:**
- Database performance review
- Security updates
- Backup verification

**Monthly:**
- Performance optimization
- Cost analysis
- Feature usage analytics

### Emergency Procedures

**Service Outage:**
1. Check service status
2. Review recent deployments
3. Rollback if necessary
4. Communicate with users

**Data Breach:**
1. Isolate affected systems
2. Assess breach scope
3. Notify authorities (POPIA compliance)
4. Implement fixes

---

## 📞 Getting Help

- **Technical Issues:** Create GitHub issue
- **Deployment Support:** Check documentation
- **Emergency:** Contact system administrator

**Useful Commands:**
```bash
# Quick health check
./scripts/health-check.sh

# View all logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update application
git pull && docker-compose up -d --build
```