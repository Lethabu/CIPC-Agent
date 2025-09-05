# 🤖 CIPC Agent Automation System

## Quick Start

```bash
# 1. Setup automation environment
cd automation && ./setup.sh

# 2. Configure credentials
nano .env.automation
# Add your CIPC username/password

# 3. Test automation
python3 cipc_runner.py annual_return '{"company_name": "Test Co", "reg_number": "123456789"}'
```

## Architecture Overview

```
User Payment → Temporal Workflow → Automation Service → CIPC Runner → CIPC Portal
                                      ↓
                               Canary Rollout (10%)
                                      ↓
                            Manual Fallback (90%)
```

## Components

### 1. CIPC Runner (`cipc_runner.py`)
- **Purpose:** Browser automation for CIPC portal
- **Tech:** Playwright + Python
- **Capabilities:** Login, form filling, OTP handling, confirmation scraping

### 2. OTP Service (`otp_service.py`)
- **Purpose:** Retrieve OTP codes from email/SMS
- **Tech:** IMAP + Redis + Flask webhook
- **Flow:** CIPC sends OTP → Email/SMS → Service extracts → Returns to Runner

### 3. Automation Service (`automationService.ts`)
- **Purpose:** Orchestrate automation with canary rollout
- **Features:** 10% automation, 90% manual fallback
- **Monitoring:** Success rates, error handling, operations alerts

### 4. Temporal Workflow (`automated_filing_workflow.go`)
- **Purpose:** Reliable workflow execution
- **Features:** Retries, error handling, state management

## Canary Rollout Strategy

### Phase 1: 10% Automation (Week 1)
- New transactions: 10% automated, 90% manual
- Monitor success rate, processing time
- Target: >95% success rate

### Phase 2: 50% Automation (Week 2)
- Increase to 50% if Phase 1 successful
- Continue monitoring and optimization

### Phase 3: 100% Automation (Week 3+)
- Full automation with manual fallback for errors
- Operations team handles exceptions only

## Security Requirements

### Credentials Management
```bash
# NEVER store in plain text
export CIPC_USERNAME="your-username"
export CIPC_PASSWORD="your-password"

# Production: Use HashiCorp Vault or AWS Secrets Manager
```

### Dedicated CIPC Account
- Create separate "filer" account: `filings@cipcagent.co.za`
- Dedicated phone number for OTP
- Professional indemnity insurance

## Testing & Validation

### Unit Tests
```bash
# Test CIPC Runner
python3 -m pytest test_cipc_runner.py

# Test OTP Service
python3 -m pytest test_otp_service.py
```

### Integration Tests
```bash
# End-to-end filing test
node test_automation_flow.js
```

### Manual Validation
1. Process test filing manually
2. Compare automated vs manual results
3. Verify CIPC confirmation matches

## Monitoring & Alerts

### Success Metrics
- **Success Rate:** >99% target
- **Processing Time:** <5 minutes average
- **Error Rate:** <1% acceptable

### Alert Triggers
- Automation failure rate >5%
- CIPC portal changes detected
- OTP retrieval timeout
- Credential authentication failure

### Operations Dashboard
```
📊 Automation Stats:
- Success Rate: 98.5%
- Avg Processing: 3.2 minutes
- Manual Fallback: 1.5%
- Queue Length: 12 pending
```

## Error Handling

### Common Failures
1. **CAPTCHA Changes:** Update OCR logic
2. **Portal Updates:** Update selectors
3. **OTP Timeout:** Increase wait time
4. **Network Issues:** Retry with backoff

### Fallback Process
```
Automation Fails → Alert Operations → Manual Processing → Update Automation
```

## Production Deployment

### Prerequisites
- [ ] Dedicated CIPC filer account
- [ ] Professional indemnity insurance
- [ ] Secure credential storage
- [ ] OTP email/SMS setup
- [ ] Operations team training

### Deployment Steps
1. **Deploy to staging environment**
2. **Run full test suite**
3. **Process 10 test filings**
4. **Deploy to production with 10% canary**
5. **Monitor for 48 hours**
6. **Gradually increase percentage**

### Rollback Plan
```bash
# Emergency rollback to 100% manual
curl -X POST /api/automation/canary -d '{"percentage": 0}'
```

## Cost Analysis

### Manual vs Automated
- **Manual:** 30 minutes per filing × R200/hour = R100 cost
- **Automated:** 3 minutes × R10/hour = R0.50 cost
- **Savings:** R99.50 per filing (99.5% cost reduction)

### Scale Impact
- **1,000 filings/month:** R99,500 savings
- **10,000 filings/month:** R995,000 savings
- **50,000 filings/month:** R4,975,000 savings

## Compliance & Legal

### CIPC Authorization
- Automation must comply with Authorized Filing Agent requirements
- Maintain audit trail of all automated filings
- Professional indemnity insurance covers automated processes

### Data Protection (POPIA)
- Client data encrypted in transit and at rest
- Automated deletion after retention period
- Audit logs for all data access

## Troubleshooting

### Common Issues

**CIPC Runner fails to login:**
```bash
# Check credentials
python3 -c "from cipc_runner import CIPCRunner; print(CIPCRunner().credentials)"

# Test manual login
python3 test_login.py
```

**OTP not received:**
```bash
# Check email connection
python3 -c "from otp_service import OTPService; OTPService()._check_email_for_otp()"

# Check SMS webhook
curl -X POST http://localhost:5000/sms-webhook -d '{"Body": "Your OTP is 123456"}'
```

**Automation service errors:**
```bash
# Check logs
docker logs cipc-agent-server | grep "automation"

# Test automation service
curl -X POST /api/automation/test -d '{"transaction_id": "test-123"}'
```

## Future Enhancements

### Phase 2 Features
- [ ] Multi-browser support (Firefox, Safari)
- [ ] Advanced CAPTCHA solving (ML-based)
- [ ] Parallel processing for bulk filings
- [ ] Real-time status updates via WebSocket

### Phase 3 Features
- [ ] AI-powered form validation
- [ ] Predictive error detection
- [ ] Auto-retry with different strategies
- [ ] Integration with CIPC API (when available)

---

**🎯 Goal: 99%+ automation success rate with <1% manual fallback**
**💰 Impact: R4.9M+ annual savings at 50K filings/month**
**🚀 Timeline: Full automation within 3 weeks**