import express from 'express';
import { TypebotOrchestrator } from '../services/typebot-orchestrator';
import { AppConfig } from '../config';
import { db } from '../src/db';
import { users } from '../../shared/schema';
import pino from 'pino';
import aisensyWebhook from '../webhooks/aisensy-webhook';

const logger = pino({ level: 'info' });

// AISensy service to send messages
async function sendAisensyMessage(phone: string, message: string) {
  const aisensyApiKey = process.env.AISENSY_API_KEY;
  if (!aisensyApiKey) {
    throw new Error('AISENSY_API_KEY not configured');
  }

  const response = await fetch('https://api.aisensy.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${aisensyApiKey}`,
    },
    body: JSON.stringify({
      phone_number: phone,
      message: message,
      message_type: 'text',
    }),
  });

  if (!response.ok) {
    throw new Error(`AISensy API error: ${response.statusText}`);
  }

  return response.json();
}

export const createPublicRouter = (orchestrator: TypebotOrchestrator, config: AppConfig) => {
  const router = express.Router();

  // This route handles email verification redirects from Firebase.
  // It forwards the Firebase query parameters to the frontend application,
  // which can then use the Firebase SDK to apply the email verification.
  router.get('/verify-email', (req, res) => {
    const frontendUrl = new URL(config.server.frontendUrl);
    frontendUrl.pathname = '/auth/action';
    frontendUrl.search = new URLSearchParams(req.query as Record<string, string>).toString();
    res.redirect(frontendUrl.toString());
  });

  // A simple status route to confirm the API is running.
  router.get('/status', (req, res) => {
    res.status(200).json({ status: 'running' });
  });

  // AiSensy webhook endpoint
  router.use('/webhook/aisensy', aisensyWebhook);

  // Onboarding webhook from Typebot
  router.post('/v1/flows/onboard', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const expectedSecret = process.env.TYPEBOT_WEBHOOK_SECRET; // Shared secret

      if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
        logger.warn('Unauthorized webhook attempt');
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { companyRegistrationNumber, whatsappNumber, popiaConsent } = req.body;

      if (!companyRegistrationNumber || !whatsappNumber || popiaConsent !== true) {
        return res.status(400).json({ success: false, error: 'Invalid data' });
      }

      // Create user record
      const newUser = await db.insert(users).values({
        companyRegNumber: companyRegistrationNumber,
        phoneNumber: whatsappNumber,
        consentGiven: true,
        consentDate: new Date(),
      }).returning();

      logger.info({ userId: newUser[0].id }, 'New user onboarded');

      // Send welcome message via AISensy
      await sendAisensyMessage(whatsappNumber, 'Welcome! Your onboarding is complete. We will contact you soon about your company registration.');

      res.status(200).json({ success: true, userId: newUser[0].id });
    } catch (error: any) {
      logger.error({ error }, 'Onboarding webhook error');
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
