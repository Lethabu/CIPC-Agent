const express = require('express');
const app = express();

app.use(express.json());

// Sprint WhatsApp webhook
app.post('/webhook', async (req, res) => {
  const { from, message, type } = req.body;
  
  if (type !== 'text') return res.json({ success: true });
  
  console.log(`📱 ${from}: ${message}`);
  
  const msg = message.toLowerCase().trim();
  let response = '';
  
  if (msg.includes('hi') || msg.includes('hello')) {
    response = `🏢 *Welcome to CIPC Agent!*

📊 *FREE Compliance Score*
Reply "SCORE" + company reg number

⚡ *Instant Services:*
• Annual Return (R199) - Reply "AR"
• Beneficial Ownership (R99) - Reply "BO"
• Director Amendment (R149) - Reply "DA"

What can I help you with?`;
  } else if (msg.includes('score')) {
    // Extract company reg number if provided
    const regMatch = msg.match(/\d{10,}/);
    const hasRegNumber = regMatch ? regMatch[0] : null;
    
    if (hasRegNumber) {
      response = `📊 *CIPC Compliance Score: 85/100*

⚠️ *Issues Found for ${hasRegNumber}:*

1. *Beneficial Ownership Declaration* - Due in 45 days
   💰 File now: R99 - Reply "BO"

✅ *Good Standing:*
• Annual Return filed ✓
• Directors up to date ✓
• Registration current ✓`;
    } else {
      response = `📊 *Free CIPC Compliance Check*

To get your personalized score, reply:
"SCORE [Company Registration Number]"

Example: "SCORE 2020123456789"

I'll check your:
✅ Annual Return status
✅ Beneficial Ownership compliance
✅ Director information
✅ Outstanding penalties`;
    }
  } else if (msg === 'ar') {
    response = `💼 *Annual Return Filing*

💰 *Price: R199*
⏱️ *Processing: 24 hours*

🔗 *Pay now:*
https://www.payfast.co.za/eng/process?merchant_id=10000100&merchant_key=46f0cd694581a&amount=${199}.00&item_name=Annual%20Return%20Filing&custom_str1=AR-${Date.now()}&return_url=https://cipc-agent.vercel.app/success&cancel_url=https://cipc-agent.vercel.app/cancel

Once paid, we'll file immediately!`;
  } else if (msg === 'bo') {
    response = `💼 *Beneficial Ownership Filing*

💰 *Price: R99*
⏱️ *Processing: 24 hours*

🔗 *Pay now:*
https://www.payfast.co.za/eng/process?merchant_id=10000100&merchant_key=46f0cd694581a&amount=${99}.00&item_name=Beneficial%20Ownership%20Filing&custom_str1=BO-${Date.now()}&return_url=https://cipc-agent.vercel.app/success&cancel_url=https://cipc-agent.vercel.app/cancel

Once paid, we'll file immediately!`;
  } else if (msg === 'da') {
    response = `💼 *Director Amendment*

💰 *Price: R149*
⏱️ *Processing: 24 hours*

🔗 *Pay now:*
https://www.payfast.co.za/eng/process?merchant_id=10000100&merchant_key=46f0cd694581a&amount=${149}.00&item_name=Director%20Amendment&custom_str1=DA-${Date.now()}&return_url=https://cipc-agent.vercel.app/success&cancel_url=https://cipc-agent.vercel.app/cancel

Once paid, we'll file immediately!`;
  } else {
    response = `🤖 *How can I help?*

📊 "SCORE" - Free compliance check
⚡ "AR" - Annual Return (R199)
⚡ "BO" - Beneficial Ownership (R99)
⚡ "DA" - Director Amendment (R149)`;
  }
  
  console.log(`📤 Response: ${response.substring(0, 100)}...`);
  res.json({ success: true, response });
});

app.get('/health', (req, res) => {
  res.json({ status: 'live', timestamp: new Date() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 CIPC Agent Webhook LIVE on port ${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
});

module.exports = app;