import express from 'express';
import { WhatsAppPaygService } from '../services/whatsappPaygService.js';
import { DeadlineSentinelAgent } from '../services/agents/deadlineSentinelAgent.js';
import { db } from '../src/db/index.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();
const paygService = new WhatsAppPaygService();
const sentinelAgent = new DeadlineSentinelAgent();

// WhatsApp webhook endpoint
router.post('/inbound', async (req, res) => {
  try {
    const { from, message } = req.body;
    const phoneNumber = from.replace(/\D/g, ''); // Clean phone number
    const userMessage = message.toLowerCase().trim();
    
    console.log(`📱 Message from ${phoneNumber}: ${userMessage}`);
    
    let response = '';
    
    // Handle different user intents
    if (userMessage.includes('hi') || userMessage.includes('hello') || userMessage.includes('start')) {
      response = await handleWelcomeMessage(phoneNumber);
    } else if (userMessage.includes('score') || userMessage.includes('check')) {
      response = await handleComplianceCheck(phoneNumber, userMessage);
    } else if (['ar', 'bo', 'afs', 'bbee', 'update'].includes(userMessage)) {
      response = await handleServiceRequest(phoneNumber, userMessage);
    } else if (userMessage.includes('upgrade') || userMessage.includes('growth') || userMessage.includes('enterprise')) {
      response = await handleSubscriptionUpgrade(phoneNumber, userMessage);
    } else if (userMessage.match(/\d{10,}/)) { // Company registration number
      response = await handleCompanyRegistration(phoneNumber, userMessage);
    } else {
      response = await handleGeneralQuery(phoneNumber, userMessage);
    }
    
    // Send response back to WhatsApp
    await sendWhatsAppMessage(phoneNumber, response);
    
    res.json({ success: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function handleWelcomeMessage(phoneNumber: string) {
  return `🏢 *Welcome to CIPC Agent!*

I'm your AI compliance assistant. I can help you with:

📊 *Free Compliance Score* - Reply "SCORE"
📋 *PAYG Services:*
• Annual Return (R199) - Reply "AR"  
• Beneficial Ownership (R99) - Reply "BO"
• Director Amendment (R149) - Reply "DA"
• B-BBEE Certificate (R199) - Reply "BBEE"

🚀 *Subscriptions:*
• Growth Plan (R899/mo) - Reply "GROWTH"
• Enterprise (R2999/mo) - Reply "ENTERPRISE"

What can I help you with today?`;
}

async function handleComplianceCheck(phoneNumber: string, message: string) {
  // Extract company reg number if provided
  const regNumberMatch = message.match(/\d{10,}/);
  const companyRegNumber = regNumberMatch ? regNumberMatch[0] : undefined;
  
  const result = await paygService.generateComplianceScore(phoneNumber, companyRegNumber);
  
  if (companyRegNumber) {
    // Activate deadline monitoring
    const user = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
    if (user.length > 0) {
      await sentinelAgent.activateForUser(user[0].id, companyRegNumber);
    }
  }
  
  return result.message;
}

async function handleServiceRequest(phoneNumber: string, serviceCode: string) {
  const serviceMap = {
    'ar': 'annual_return',
    'bo': 'beneficial_ownership', 
    'da': 'director_amendment',
    'bbee': 'bbee_certificate',
    'afs': 'afs_submission',
    'update': 'company_update'
  };
  
  const serviceType = serviceMap[serviceCode];
  if (!serviceType) {
    return "❌ Invalid service code. Reply 'HELP' for available services.";
  }
  
  // Check if urgent (less than 7 days to deadline)
  const isUrgent = await checkUrgency(phoneNumber, serviceType);
  
  const result = await paygService.handlePaygRequest(phoneNumber, serviceType as any, isUrgent);
  return result.message;
}

async function handleSubscriptionUpgrade(phoneNumber: string, message: string) {
  const tier = message.includes('enterprise') ? 'enterprise' : 'growth';
  const result = await paygService.handleSubscriptionUpgrade(phoneNumber, tier);
  return result.message;
}

async function handleCompanyRegistration(phoneNumber: string, message: string) {
  const regNumber = message.match(/\d{10,}/)?.[0];
  if (!regNumber) {
    return "❌ Invalid company registration number format.";
  }
  
  // Update user with company reg number and activate monitoring
  const user = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
  if (user.length > 0) {
    await db.update(users)
      .set({ companyRegNumber: regNumber, updatedAt: new Date() })
      .where(eq(users.id, user[0].id));
    
    await sentinelAgent.activateForUser(user[0].id, regNumber);
  }
  
  return `✅ Company ${regNumber} registered successfully!\n\n🎯 Deadline monitoring is now active. You'll receive automatic reminders for all compliance deadlines.\n\nReply "SCORE" to see your current compliance status.`;
}

async function handleGeneralQuery(phoneNumber: string, message: string) {
  // Use AI to handle general queries
  return `🤖 I understand you're asking about: "${message}"\n
For specific help:\n• Reply "SCORE" for compliance check\n• Reply "HELP" for service menu\n• Reply "SUPPORT" to speak with a human\n\nHow else can I assist you?`;
}

async function checkUrgency(phoneNumber: string, serviceType: string): Promise<boolean> {
  // Check if user has upcoming deadlines for this service type
  const user = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
  if (user.length === 0) return false;
  
  const score = await sentinelAgent.getComplianceScore(user[0].id);
  const urgentIssues = score.issues.filter(issue => 
    issue.type === 'overdue' || 
    (issue.type === 'upcoming' && issue.description.toLowerCase().includes(serviceType.replace('_', ' ')))
  );
  
  return urgentIssues.length > 0;
}

async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  // Integration with WhatsApp Business API or AiSensy
  console.log(`📤 Sending to ${phoneNumber}: ${message}`);
  
  // Mock implementation - replace with actual WhatsApp API call
  const whatsappPayload = {
    to: phoneNumber,
    message: message,
    type: 'text'
  };
  
  // Example AiSensy API call:
  // await axios.post('https://backend.aisensy.com/campaign/t1/api/v2', whatsappPayload, {
  //   headers: { 'X-AiSensy-API-KEY': process.env.AISENSY_API_KEY }
  // });
}

// Payment webhook handler
router.post('/payment/webhook', async (req, res) => {
  try {
    const { payment_status, custom_str1: transactionId } = req.body;
    
    if (payment_status === 'COMPLETE') {
      // Update transaction status and trigger workflow
      await db.update(paygTransactions)
        .set({ status: 'paid', completedAt: new Date() })
        .where(eq(paygTransactions.id, transactionId));
      
      // Trigger Temporal workflow for processing
      // await temporalClient.workflow.start(ProcessFilingWorkflow, { transactionId });
      
      console.log(`✅ Payment completed for transaction: ${transactionId}`);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;