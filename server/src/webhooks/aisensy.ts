import express from 'express';
import crypto from 'crypto';

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

router.post('/', (req, res) => {
  const secret = process.env.AISENSY_WEBHOOK_SECRET;
  const signature = req.headers['x-aisensy-signature'] as string | undefined;

  if (!secret) {
    req.log.error('AISENSY_WEBHOOK_SECRET is not configured.');
    return res.status(500).send('Webhook secret not configured');
  }

  if (!verifySignature(req.body, signature, secret)) {
    req.log.warn('Invalid AiSensy webhook signature received.');
    return res.status(401).send('Invalid signature');
  }

  try {
    // The raw body buffer has already been verified. Now, parse it as JSON to process the event.
    const payload = JSON.parse(req.body.toString('utf8'));

    // Placeholder for idempotent event processing and asynchronous handling
    req.log.info({ eventId: payload.id || 'N/A' }, 'Received valid AiSensy webhook. Enqueueing for processing.');

    // In a real implementation, this would be an async call to a message queue or job scheduler
    // processWebhookEvent(payload);

    // Respond quickly to AiSensy to prevent timeouts
    res.status(200).json({ ok: true, message: "Event received" });
  } catch (error) {
    req.log.error({ err: error }, 'Error processing AiSensy webhook');
    res.status(500).send('Error processing webhook');
  }
});

export default router;
