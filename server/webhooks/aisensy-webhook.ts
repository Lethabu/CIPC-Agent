import { Router, Request, Response } from 'express';
import { db } from '../src/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import pino from 'pino';
import crypto from 'crypto';

const logger = pino({ level: 'info' });
const router = Router();

interface AisensyWebhookPayload {
  from: string;
  message: string;
  type: string;
  messageId?: string;
  timestamp?: string;
  phone?: string;
  text?: string;
}

// Verify AiSensy webhook signature
const verifyAisensySignature = (req: Request): boolean => {
  const signature = req.headers['x-aisensy-signature'] as string;
  const webhookSecret = process.env.AISENSY_WEBHOOK_SECRET;
  
  if (!webhookSecret || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

// Send message via AiSensy API
async function sendAisensyMessage(phone: string, message: string) {
  const aisensyApiKey = process.env.AISENSY_API_KEY;
  if (!aisensyApiKey) {
    throw new Error('AISENSY_API_KEY not configured');
  }

  const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-AiSensy-Project-API-Pwd': aisensyApiKey,
    },
    body: JSON.stringify({
      apiKey: aisensyApiKey,
      campaignName: 'cipc_agent_response',
      destination: phone,
      userName: 'CIPC Agent',
      templateParams: [message],
      source: 'new-landing-page form',
      media: {},
      buttons: {},
      carouselCards: [],
      location: {},
      paramsFallbackValue: {
        FirstName: 'User'
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`AiSensy API error: ${response.statusText}`);
  }

  return response.json();
}

// Main webhook handler
router.post('/', async (req: Request, res: Response) => {
  try {
    // Verify signature if webhook secret is configured
    if (process.env.AISENSY_WEBHOOK_SECRET && !verifyAisensySignature(req)) {
      logger.warn('Invalid webhook signature');
      return res.status(401).json({ success: false, error: 'Invalid signature' });
    }

    const payload = req.body as AisensyWebhookPayload;
    logger.info({ payload }, 'Received AiSensy webhook');

    // Handle different payload formats
    const userPhone = payload.from || payload.phone;
    const messageText = (payload.message || payload.text || '').trim().toUpperCase();

    if (!userPhone || !messageText) {
      logger.warn('Invalid payload received from AiSensy');
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    // Process different message types
    if (messageText === 'YES' || messageText === 'CONSENT') {
      await handleConsent(userPhone, true);
    } else if (messageText === 'NO' || messageText === 'STOP' || messageText === 'REVOKE') {
      await handleConsent(userPhone, false);
    } else if (messageText === 'HI' || messageText === 'HELLO' || messageText === 'START') {
      await handleWelcome(userPhone);
    } else if (messageText === 'SCORE' || messageText === 'STATUS') {
      await handleComplianceScore(userPhone);
    } else if (messageText.includes('AR') || messageText.includes('ANNUAL RETURN')) {
      await handleServiceRequest(userPhone, 'AR');
    } else {
      await handleGeneralMessage(userPhone, messageText);
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error: any) {
    logger.error({ error }, 'Webhook processing error');
    res.status(500).json({ success: false, error: error.message });
  }
});

async function handleConsent(phone: string, consent: boolean) {
  try {
    logger.info(`Processing consent ${consent ? 'grant' : 'revocation'} for phone: ${phone}`);

    const result = await db.insert(users)
      .values({ 
        phoneNumber: phone, 
        consentGiven: consent, 
        consentDate: new Date() 
      })
      .onConflictDoUpdate({ 
        target: users.phoneNumber, 
        set: { consentGiven: consent, consentDate: new Date() } 
      })
      .returning({ phone: users.phoneNumber, consentGiven: users.consentGiven });

    const message = consent 
      ? "✅ Thank you for your consent! You're now registered with CIPC Agent. Type 'SCORE' to check your compliance status or 'AR' for Annual Return services."
      : "❌ Your consent has been revoked. You will no longer receive messages from CIPC Agent. Type 'YES' to opt back in.";

    await sendAisensyMessage(phone, message);
    logger.info({ result }, `Consent ${consent ? 'granted' : 'revoked'} for ${phone}`);
  } catch (error: any) {
    logger.error({ error }, `Error processing consent for ${phone}`);
    throw error;
  }
}

async function handleWelcome(phone: string) {
  const message = `🏢 Welcome to CIPC Agent!

Your AI-powered compliance assistant for South African companies.

Available commands:
• YES - Give consent for services
• SCORE - Check compliance status  
• AR - Annual Return services
• STOP - Revoke consent

How can I help you today?`;

  await sendAisensyMessage(phone, message);
  logger.info(`Welcome message sent to ${phone}`);
}

async function handleComplianceScore(phone: string) {
  // Check if user has given consent
  const user = await db.select()
    .from(users)
    .where(eq(users.phoneNumber, phone))
    .limit(1);

  if (!user.length || !user[0].consentGiven) {
    await sendAisensyMessage(phone, "⚠️ Please give consent first by typing 'YES' to access compliance services.");
    return;
  }

  const message = `📊 Compliance Score for your company:

🟢 Status: Active
📅 Last Filing: 2023-12-15
⚡ Score: 85/100

Next due dates:
• Annual Return: 2024-06-30
• Tax Return: 2024-07-31

Type 'AR' to file your Annual Return now!`;

  await sendAisensyMessage(phone, message);
  logger.info(`Compliance score sent to ${phone}`);
}

async function handleServiceRequest(phone: string, service: string) {
  const user = await db.select()
    .from(users)
    .where(eq(users.phoneNumber, phone))
    .limit(1);

  if (!user.length || !user[0].consentGiven) {
    await sendAisensyMessage(phone, "⚠️ Please give consent first by typing 'YES' to access our services.");
    return;
  }

  const message = `📋 ${service} Service Request

I'll help you with your Annual Return filing.

What you'll need:
✓ Company registration number
✓ Financial statements
✓ Director information

Ready to start? I'll guide you through each step.

Reply with your company registration number to begin.`;

  await sendAisensyMessage(phone, message);
  logger.info(`Service request ${service} initiated for ${phone}`);
}

async function handleGeneralMessage(phone: string, message: string) {
  const response = `🤖 I received: "${message}"

I'm CIPC Agent, your compliance assistant. 

Try these commands:
• YES - Give consent
• SCORE - Check compliance
• AR - Annual Return help
• STOP - Unsubscribe

Need human help? Contact support@cipcagent.co.za`;

  await sendAisensyMessage(phone, response);
  logger.info(`General response sent to ${phone} for message: ${message}`);
}

export default router;