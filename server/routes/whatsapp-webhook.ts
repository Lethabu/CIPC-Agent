import express from 'express';
import { SprintWhatsAppService } from '../services/sprintWhatsappService.js';
import { WhatsAppPaygService } from '../services/whatsappPaygService.js';
import UpgradeDetectionService from '../services/upgradeDetectionService.js';

const router = express.Router();
const sprintService = new SprintWhatsAppService();
const paygService = new WhatsAppPaygService();
const upgradeService = new UpgradeDetectionService();

// Main webhook endpoint for AiSensy
router.post('/webhook', async (req, res) => {
  try {
    const { from, message, type } = req.body;
    
    if (type !== 'text' || !message) {
      return res.json({ success: true });
    }

    const phoneNumber = from.replace(/\D/g, '');
    const userMessage = message.toLowerCase().trim();
    
    let response = '';

    // Route to appropriate service based on message content
    if (userMessage.includes('score') || userMessage.includes('check')) {
      const companyRegMatch = message.match(/\d{10,}/);
      const result = await paygService.generateComplianceScore(phoneNumber, companyRegMatch?.[0]);
      response = result.message;
    } 
    else if (['ar', 'bo', 'da'].includes(userMessage)) {
      const isUrgent = userMessage.includes('urgent') || userMessage.includes('rush');
      const serviceMap = { ar: 'annual_return', bo: 'beneficial_ownership', da: 'director_amendment' };
      const result = await paygService.handlePaygRequest(phoneNumber, serviceMap[userMessage], isUrgent);
      response = result.message;
    }
    else if (userMessage.includes('upgrade') || userMessage.includes('growth') || userMessage.includes('enterprise')) {
      const tier = userMessage.includes('enterprise') ? 'enterprise' : 'growth';
      const result = await paygService.handleSubscriptionUpgrade(phoneNumber, tier);
      response = result.message;
    }
    else {
      response = await sprintService.handleMessage(phoneNumber, message);
    }

    // Send response back via AiSensy
    await sendWhatsAppMessage(phoneNumber, response);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Payment confirmation webhook
router.post('/payment-confirmed', async (req, res) => {
  try {
    const { phoneNumber, serviceType, transactionId, amount } = req.body;
    
    // Send confirmation message
    const confirmationMessage = `✅ *Payment Confirmed - R${amount}*

Service: ${serviceType}
Reference: ${transactionId}

🔄 *Processing your filing now...*

You'll receive updates as we progress:
1. ✅ Payment confirmed
2. 🔄 Documents being prepared  
3. 📤 Submitted to CIPC
4. ✅ Filing complete

Expected completion: 24-48 hours

Questions? Reply "STATUS" anytime.`;

    await sendWhatsAppMessage(phoneNumber, confirmationMessage);
    
    // Check for upgrade opportunity
    await upgradeService.processUpgradeFromTransaction(transactionId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to process payment confirmation' });
  }
});

async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<void> {
  try {
    const response = await fetch(`${process.env.AISENSY_API_URL}/send-message`, {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.AISENSY_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: phoneNumber,
        message: message,
        type: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
  }
}

export default router;