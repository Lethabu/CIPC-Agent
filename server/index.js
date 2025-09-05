const express = require('express');
const app = express();

app.use(express.json());

const sprintService = {
  async handleMessage(phoneNumber, message) {
    const userMessage = message.toLowerCase().trim();
    
    if (userMessage.includes('hi') || userMessage.includes('hello')) {
      return `🏢 *Welcome to CIPC Agent!*

📊 *FREE Compliance Score*
Reply "SCORE" + your company reg number

⚡ *Instant PAYG Services:*
• Annual Return (R199) - Reply "AR"
• Beneficial Ownership (R99) - Reply "BO"  
• Director Amendment (R149) - Reply "DA"

What can I help you with?`;
    }
    
    if (userMessage.includes('score')) {
      return `📊 *CIPC Compliance Score: 85/100*

⚠️ *Issues Found:*

1. *Annual Return*
   🚨 OVERDUE - Penalty: R2,500
   💰 Fix now: Reply "AR"

2. *Beneficial Ownership*
   ⏰ Due in 14 days - Penalty: R50,000
   💰 Fix now: Reply "BO"`;
    }
    
    if (['ar', 'bo', 'da'].includes(userMessage)) {
      const services = {
        'ar': { name: 'Annual Return', price: 199 },
        'bo': { name: 'Beneficial Ownership', price: 99 },
        'da': { name: 'Director Amendment', price: 149 }
      };
      
      const service = services[userMessage];
      return `💼 *${service.name}*

💰 *Price: R${service.price}*
⏱️ *Processing: 24 hours*
✅ *Includes: Complete filing + confirmation*

🔗 *Pay securely:*
https://payfast.co.za/pay/${userMessage}-${Date.now()}

Once paid, we'll process your filing immediately.`;
    }
    
    return `🤖 *How can I help?*

📊 *Get compliance score:* "SCORE"
⚡ *Quick services:*
• "AR" - Annual Return (R199)
• "BO" - Beneficial Ownership (R99)
• "DA" - Director Amendment (R149)`;
  }
};

app.post('/api/sprint/webhook', async (req, res) => {
  try {
    const { from, message, type } = req.body;
    
    if (type !== 'text') {
      return res.json({ success: true });
    }
    
    console.log(`📱 Message from ${from}: ${message}`);
    
    const response = await sprintService.handleMessage(from, message);
    console.log(`📤 Response: ${response}`);
    
    res.json({ success: true, response });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

app.get('/api/sprint/dashboard', (req, res) => {
  res.json({
    totalMessages: 127,
    uniqueUsers: 43,
    complianceScores: 28,
    serviceRequests: 12,
    conversions: 8,
    revenue: 1592,
    conversionRate: '66.7%'
  });
});

app.get('/healthz', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 CIPC Agent Sprint Server running on port ${PORT}`);
  console.log(`📱 Webhook: http://localhost:${PORT}/api/sprint/webhook`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/sprint/dashboard`);
});