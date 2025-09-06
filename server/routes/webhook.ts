import express from 'express';
import { WhatsAppIntegration } from '../services/whatsappIntegration.js';
import { webhookLimiter, validateInput, logDataAccess } from '../security.js';

const router = express.Router();
const whatsapp = new WhatsAppIntegration();

// WhatsApp webhook endpoint
router.post('/whatsapp', webhookLimiter, validateInput, logDataAccess, async (req, res) => {
  try {
    const { from, message, type } = req.body;
    
    if (type !== 'text' || !message) {
      return res.json({ success: true });
    }

    const response = await whatsapp.processInbound({ from, message });
    await whatsapp.sendMessage(from, response);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// Payment webhook
router.post('/payment', validateInput, async (req, res) => {
  try {
    const { payment_status, custom_str1, amount_gross } = req.body;
    
    if (payment_status === 'COMPLETE') {
      // Update transaction status
      console.log(`Payment completed: ${custom_str1} - R${amount_gross}`);
      
      // Send confirmation via WhatsApp
      const phoneNumber = req.body.custom_str2; // Store phone in custom_str2
      if (phoneNumber) {
        await whatsapp.sendMessage(
          phoneNumber, 
          `✅ Payment confirmed - R${amount_gross}\n\nYour filing is being processed. You'll receive updates via WhatsApp.`
        );
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

export default router;