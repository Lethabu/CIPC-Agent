const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// WhatsApp webhook
app.post('/webhook/whatsapp', (req, res) => {
  const { from, message } = req.body;
  console.log(`WhatsApp message from ${from}: ${message}`);
  
  let response = '';
  const msg = (message || '').toLowerCase();
  
  if (msg.includes('score')) {
    response = '📊 *Compliance Score: 75/100*\n\n⚠️ Issues found:\n• Annual Return overdue\n• BO filing due in 14 days\n\nFix now: Reply "AR" or "BO"';
  } else if (msg === 'ar') {
    response = '💼 *Annual Return: R199*\n\n✅ Complete filing + confirmation\n⏱️ 24-48 hour processing\n\nPay: https://pay.cipcagent.co.za/ar';
  } else if (msg === 'bo') {
    response = '💼 *Beneficial Ownership: R99*\n\n✅ Complete filing + confirmation\n⏱️ 24-48 hour processing\n\nPay: https://pay.cipcagent.co.za/bo';
  } else if (msg === 'da') {
    response = '💼 *Director Amendment: R149*\n\n✅ Complete filing + confirmation\n⏱️ 24-48 hour processing\n\nPay: https://pay.cipcagent.co.za/da';
  } else {
    response = '🏢 *CIPC Agent*\n\nReply:\n• "SCORE" - Free compliance check\n• "AR" - Annual Return (R199)\n• "BO" - Beneficial Ownership (R99)\n• "DA" - Director Amendment (R149)';
  }
  
  console.log(`Response: ${response}`);
  res.json({ success: true, response });
});

// Payment webhook
app.post('/webhook/payment', (req, res) => {
  const { payment_status, custom_str1, amount_gross } = req.body;
  console.log(`Payment webhook: ${payment_status} - ${custom_str1} - R${amount_gross}`);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ CIPC Agent server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 WhatsApp webhook: http://localhost:${PORT}/webhook/whatsapp`);
  console.log(`💳 Payment webhook: http://localhost:${PORT}/webhook/payment`);
});