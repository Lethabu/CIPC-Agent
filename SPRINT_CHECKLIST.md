# 🎯 CIPC Agent 72-Hour Sprint Checklist

## **PRE-FLIGHT (Days 1-2)**

### Day 1: Legal & Financial
- [ ] Register "CIPC Agent (Pty) Ltd" (or use existing entity)
- [ ] Open business bank account (TymeBank/FNB eWallet Pro)
- [ ] Get insurance quotes (R2M Professional Indemnity + R1M Fidelity)
- [ ] Schedule Police Clearance Certificate appointments
- [ ] Get certified copies of director IDs

### Day 2: Technology & Accounts
- [ ] Get AiSensy API key + start WABA approval
- [ ] Set up PayFast merchant account (start verification)
- [ ] Secure @CIPCAgent handles (TikTok, X)
- [ ] Create 50-lead Google Sheet (Name, Company, LinkedIn)
- [ ] Prepare demo script and Calendly link

## **72-HOUR SPRINT (Days 3-5)**

### Day 3 (Hours 0-24): LAUNCH FUNNEL
- [ ] **CRITICAL:** Deploy public landing page (`./deploy-now.sh`)
- [ ] Configure AiSensy webhook to your server
- [ ] Test WhatsApp flow end-to-end
- [ ] Send 20 LinkedIn DMs to lead list
- [ ] Post in 10 SA SMME Facebook groups
- [ ] Create first TikTok video (Fear-based urgency)
- [ ] Book 5 demo calls for Day 4

### Day 4 (Hours 25-48): CONVERT LEADS
- [ ] Monitor AiSensy Smart Inbox personally
- [ ] Conduct 5-10 live demos
- [ ] Show "Magic Moment" (WhatsApp + Smart Inbox)
- [ ] Manually file first client's Annual Return on CIPC portal
- [ ] Send PayFast payment links via Smart Inbox
- [ ] Follow up with all demo attendees

### Day 5 (Hours 49-72): CLOSE & SCALE
- [ ] Call every demo lead who hasn't paid
- [ ] Use "3 spots left" urgency script
- [ ] Process payments and send confirmations
- [ ] Create "CIPC Agent Founders Club" WhatsApp group
- [ ] **MILESTONE:** Celebrate 10th paying customer
- [ ] Post LinkedIn/X announcement with social proof

## **CRITICAL SUCCESS METRICS**

| Metric | Target | Actual |
|--------|--------|--------|
| Landing page deployed | ✅ Live | [ ] |
| WhatsApp webhook working | ✅ Responding | [ ] |
| Demo calls booked | 10+ | [ ] |
| Demo calls completed | 5+ | [ ] |
| Payment links sent | 10+ | [ ] |
| Paying customers | 10 | [ ] |
| Total revenue | R1,990+ | R___ |

## **EMERGENCY CONTACTS & SCRIPTS**

### Demo Script (5-minute version)
1. **Hook:** "I'm going to show you how to do your CIPC compliance in 90 seconds"
2. **Demo:** WhatsApp conversation → compliance score → instant quote
3. **Magic:** Switch to Smart Inbox view → "Human expert backup"
4. **Close:** "We have 3 spots left for our founding customers. Ready to join?"

### LinkedIn DM Template
```
Hi [Name], 

Saw your post about [specific business challenge]. 

We just launched a WhatsApp bot that does CIPC compliance in 90 seconds. 

Free compliance score + instant filing if needed.

Worth a quick look? wa.me/27123456789

Best,
[Your name]
```

### Facebook Group Post Template
```
🏢 SA Business Owners: Get your CIPC compliance score in 30 seconds

Just launched a WhatsApp service that checks your compliance status instantly and can file anything that's overdue.

No more CIPC queues or paperwork stress.

Try it free: wa.me/27123456789

#SMME #CIPC #Compliance #SouthAfrica
```

## **TECHNICAL QUICK REFERENCE**

### Test Webhook
```bash
curl -X POST http://localhost:3000/webhook \
-H "Content-Type: application/json" \
-d '{"from": "+27123456789", "message": "hi", "type": "text"}'
```

### Deploy Landing Page
```bash
cd client && npm run build && npx vercel --prod
```

### Check Server Status
```bash
curl http://localhost:3000/health
```

## **PAYMENT PROCESSING (Manual)**

1. **Client says "YES"** → Generate PayFast link manually
2. **Payment confirmed** → Log into CIPC portal
3. **File manually** → Download confirmation
4. **Send WhatsApp confirmation** with reference number
5. **Add to Founders Club** WhatsApp group

## **SUCCESS CELEBRATION**

When you hit 10 paying customers:

**LinkedIn Post:**
```
💥 BOOM. 

In 72 hours, we went from idea to live business.

10 paying customers ✅
R2,000+ revenue ✅  
80+ hours saved for SA businesses ✅

The SMME compliance revolution starts now.

#SaaS #SMME #SouthAfrica #Entrepreneurship
```

---

**🎯 MISSION: Zero to 10 paying customers in 72 hours**
**💰 TARGET: R1,990+ revenue**
**🚀 MOTTO: "Relentless execution beats perfect planning"**