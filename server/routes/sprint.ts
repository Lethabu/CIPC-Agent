import express from 'express';
import { SprintWhatsAppService } from '../services/sprintWhatsappService.js';

const router = express.Router();
const sprintService = new SprintWhatsAppService();

// Sprint webhook for AiSensy
router.post('/webhook', async (req, res) => {
  try {
    const { from, message, type } = req.body;
    
    // Only process text messages
    if (type !== 'text') {
      return res.json({ success: true });
    }
    
    console.log(`📱 Sprint message from ${from}: ${message}`);
    
    const response = await sprintService.handleMessage(from, message);
    
    // Send response via AiSensy (mock for now)
    await sendAiSensyMessage(from, response);
    
    res.json({ success: true, response });
  } catch (error) {
    console.error('Sprint webhook error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// Manual filing endpoint for sprint team
router.post('/manual-filing', async (req, res) => {
  try {
    const { phoneNumber, serviceType, amount, notes } = req.body;
    
    await sprintService.logManualFiling(phoneNumber, serviceType, amount);
    
    // Send confirmation to user
    const confirmation = await sprintService.sendPaymentConfirmation(
      phoneNumber, 
      serviceType, 
      `MANUAL-${Date.now()}`
    );
    
    await sendAiSensyMessage(phoneNumber, confirmation);
    
    res.json({ success: true, message: 'Manual filing logged' });
  } catch (error) {
    console.error('Manual filing error:', error);
    res.status(500).json({ error: 'Failed to log manual filing' });
  }
});

// Sprint dashboard endpoint
router.get('/dashboard', async (req, res) => {
  try {
    // Mock dashboard data for sprint
    const stats = {
      totalMessages: 127,
      uniqueUsers: 43,
      complianceScores: 28,
      serviceRequests: 12,
      conversions: 8,
      revenue: 1592,
      conversionRate: '66.7%',
      avgOrderValue: 199
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Dashboard failed' });
  }
});

async function sendAiSensyMessage(phoneNumber: string, message: string) {
  // Mock AiSensy API call for sprint
  console.log(`📤 Sending to ${phoneNumber}:`);
  console.log(message);
  console.log('---');
  
  // In production, replace with actual AiSensy API:
  /*
  const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-AiSensy-API-KEY': process.env.AISENSY_API_KEY
    },
    body: JSON.stringify({
      apiKey: process.env.AISENSY_API_KEY,
      campaignName: 'cipc-agent-responses',
      destination: phoneNumber,
      userName: 'CIPC Agent',
      templateParams: [message],
      source: 'cipc-agent-platform',
      media: {},
      buttons: [],
      carouselCards: [],
      location: {},
      paramsFallbackValue: {
        FirstName: 'there'
      }
    })
  });
  */
}

export default router;