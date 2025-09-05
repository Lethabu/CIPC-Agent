# 🚀 CIPC Agent 72-Hour Sprint

## Quick Start

```bash
# 1. Setup environment
cp .env.sprint .env
# Update AISENSY_API_KEY in .env

# 2. Launch sprint platform
./scripts/sprint-launch.sh

# 3. Test WhatsApp bot
curl -X POST http://localhost:3000/api/sprint/webhook \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "hi", "type": "text"}'
```

## Sprint Goals

### Day 1: Foundation & Funnel Live ✅
- [x] Deploy public landing page
- [x] Configure WhatsApp webhook
- [x] Launch "Free CIPC Compliance Score"
- [x] Begin manual outreach

### Day 2: First Demos & Manual Processing 🔄
- [ ] Conduct 5-10 demo calls
- [ ] Process first PAYG filing manually
- [ ] Send first PayFast payment link
- [ ] Track conversions

### Day 3: Close First 10 Clients 🎯
- [ ] Follow up intensively
- [ ] Convert leads to paying customers
- [ ] Celebrate 10th client milestone
- [ ] Post social proof

## Key Endpoints

### WhatsApp Webhook
```
POST /api/sprint/webhook
Body: {"from": "+27123456789", "message": "hi", "type": "text"}
```

### Manual Filing
```
POST /api/sprint/manual-filing
Body: {
  "phoneNumber": "+27123456789",
  "serviceType": "Annual Return",
  "amount": 199,
  "notes": "Manual processing for sprint"
}
```

### Dashboard
```
GET /api/sprint/dashboard
GET http://localhost:8080 (HTML dashboard)
```

## WhatsApp Commands

| Command | Response | Action |
|---------|----------|--------|
| `hi`, `hello`, `start` | Welcome message | Onboard user |
| `score` | Compliance score | Generate leads |
| `AR` | Annual Return quote | R199 service |
| `BO` | Beneficial Ownership quote | R99 service |
| `DA` | Director Amendment quote | R149 service |
| Company reg number | Register company | Enable monitoring |

## Manual Processing Workflow

1. **User requests service** (e.g., "AR")
2. **Bot sends quote** with payment link
3. **User pays** (PayFast/manual)
4. **Team processes filing** on CIPC portal
5. **Send confirmation** via WhatsApp
6. **Log transaction** via `/manual-filing` endpoint

## Revenue Tracking

Current sprint metrics available at:
- API: `GET /api/sprint/dashboard`
- Dashboard: `http://localhost:8080`

Target: **10 paying customers** = **~R1,990 revenue**

## AiSensy Configuration

1. **Webhook URL:** `https://your-domain.com/api/sprint/webhook`
2. **Method:** POST
3. **Content-Type:** application/json

Expected payload:
```json
{
  "from": "+27123456789",
  "message": "user message text",
  "type": "text"
}
```

## Payment Processing

### Sprint Mode (Manual)
1. Generate PayFast link manually
2. Send via AiSensy Smart Inbox
3. Confirm payment manually
4. Process filing on CIPC portal
5. Log via `/manual-filing` endpoint

### Production Mode (Automated)
- Automatic PayFast integration
- Temporal workflow processing
- Real-time status updates

## Troubleshooting

### WhatsApp not responding
```bash
# Check webhook
curl -X POST http://localhost:3000/api/sprint/webhook \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "test", "type": "text"}'

# Check logs
docker-compose -f docker-compose.sprint.yml logs -f sprint-server
```

### Database issues
```bash
# Check database
docker-compose -f docker-compose.sprint.yml exec postgres psql -U postgres -d cipc_agent -c "SELECT COUNT(*) FROM users;"
```

### Service not starting
```bash
# Restart services
docker-compose -f docker-compose.sprint.yml restart

# Rebuild
docker-compose -f docker-compose.sprint.yml up --build -d
```

## Success Metrics

### Sprint Success (72 hours)
- ✅ Live WhatsApp funnel
- ✅ 10+ demo calls completed
- ✅ 10 paying customers
- ✅ ~R2,000 revenue generated

### Phase 2 Targets (Month 3)
- 1,000 PAYG transactions
- 100 subscription users
- R240k monthly revenue

### Phase 3 Targets (Month 18)
- 50,000 PAYG transactions
- 25,000 subscription users
- R25M ARR

## Next Steps After Sprint

1. **Automate backend** with Temporal workflows
2. **Launch TikTok** viral content strategy
3. **Deploy Lead Scout** for proactive outreach
4. **Secure CIPC** Authorized Agent status
5. **Scale marketing** and team

## Support

- **Logs:** `docker-compose -f docker-compose.sprint.yml logs -f`
- **Health:** `curl http://localhost:3000/healthz`
- **Dashboard:** `http://localhost:8080`

---

**🎯 Sprint Motto: "From Zero to Revenue in 72 Hours"**