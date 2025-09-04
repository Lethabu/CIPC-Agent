import express from 'express';
import crypto from 'crypto';
import { whatsappService } from '../../services/whatsappService.js';
import { whatsappAIService } from '../../services/whatsappAIService.js';

const router = express.Router();

function verifySignature(rawBody: Buffer, signatureHeader: string | undefined, secret: string): boolean {
  if (!signatureHeader || !rawBody || !secret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

router.post('/', async (req, res) => {
  const secret = process.env.AISENSY_WEBHOOK_SECRET;
  const signature = req.headers['x-aisensy-signature'] as string | undefined;

  if (!secret) {
    // @ts-ignore
    req.log.error('AISENSY_WEBHOOK_SECRET is not configured.');
    return res.status(500).send('Webhook secret not configured');
  }

  if (!verifySignature(req.body, signature, secret)) {
    // @ts-ignore
    req.log.warn('Invalid AiSensy webhook signature received.');
    return res.status(401).send('Invalid signature');
  }

  try {
    // The raw body buffer has already been verified. Now, parse it as JSON to process the event.
    const payload = JSON.parse(req.body.toString('utf8'));
    const parsedMessage = whatsappService.parseIncomingMessage(payload);

    if (parsedMessage) {
      // @ts-ignore
      req.log.info({ from: parsedMessage.from, messageId: parsedMessage.messageId }, 'Processing incoming WhatsApp message.');
      const aiResponse = await whatsappAIService.processMessage(parsedMessage.from, parsedMessage.message);
      await whatsappService.sendMessage({ to: parsedMessage.from, message: aiResponse.message, type: 'text' });
    }

    res.status(200).json({ ok: true, message: "Event received" });
  } catch (error) {
    // @ts-ignore
    req.log.error({ err: error }, 'Error processing AiSensy webhook');
    res.status(500).send('Error processing webhook');
  }
});

export default router;
