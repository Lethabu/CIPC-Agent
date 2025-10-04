import { Router, Request, Response } from 'express';
import { db } from '../db'; // Assuming you have a db export
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

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

      // Upsert logic: Insert a new user or update consent if they already exist.
      const result = await db.insert(users)
        .values({ id: uuidv4(), phone: userPhone, consentGiven: true, consentDate: new Date() })
        .onConflictDoUpdate({ target: users.phone, set: { consentGiven: true, consentDate: new Date() } })
        .returning({ phone: users.phone, consentGiven: users.consentGiven });

      logger.info({ result }, `Consent processed for ${userPhone}`);
      res.status(200).json({ success: true, message: 'Consent processed' });
    } catch (error: any) {
      logger.error({ error }, `Error processing consent for ${userPhone}`);
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (messageText === 'STOP') {
    try {
      logger.info(`Processing consent revocation for phone: ${userPhone}`);

      // Update the user record to set consentGiven to false.
      // We don't need to worry if the user doesn't exist; the update will simply affect 0 rows.
      const result = await db.update(users)
        .set({ consentGiven: false, consentDate: new Date() }) // Record when they opted out
        .where(eq(users.phone, userPhone))
        .returning({ phone: users.phone, consentGiven: users.consentGiven });

      logger.info({ result }, `Consent revoked for ${userPhone}`);
      res.status(200).json({ success: true, message: 'Consent revoked' });
    } catch (error: any) {
      logger.error({ error }, `Error processing consent revocation for ${userPhone}`);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    logger.info(`Non-consent message received from ${userPhone}. Ignoring.`);
    res.status(200).json({ success: true, message: 'Message received, no action taken' });
  }
});

export default router;
