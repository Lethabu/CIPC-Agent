import { Router, Request, Response } from 'express';
import { db } from './db'; // Assuming you have a db export
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import pino from 'pino';

const logger = pino({ level: 'info' });
const router = Router();

interface AisensyWebhookPayload {
  phone: string;
  text: string;
  messageId: string;
  timestamp: string;
}

router.post('/', async (req: Request, res: Response) => {
  const payload = req.body as AisensyWebhookPayload;
  logger.info({ payload }, 'Received AISensy webhook');

  // Basic validation
  if (!payload.phone || !payload.text) {
    logger.warn('Invalid payload received from AISensy');
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }

  const userPhone = payload.phone;
  const messageText = payload.text.trim().toUpperCase();

  if (messageText === 'YES') {
    try {
      logger.info(`Processing consent for phone: ${userPhone}`);

      // Using Drizzle ORM to update the user record
      // This will update the user if they exist, or do nothing if they don't.
      // You might want to create a user entry if one doesn't exist.
      const result = await db.update(users)
        .set({ consentGiven: true, consentDate: new Date() })
        .where(eq(users.phoneNumber, userPhone))
        .returning({ phone: users.phoneNumber });

      logger.info({ result }, `Consent updated for ${userPhone}`);
      res.status(200).json({ success: true, message: 'Consent processed' });
    } catch (error: any) {
      logger.error({ error }, `Error processing consent for ${userPhone}`);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    logger.info(`Non-consent message received from ${userPhone}. Ignoring.`);
    res.status(200).json({ success: true, message: 'Message received, no action taken' });
  }
});

export default router;
