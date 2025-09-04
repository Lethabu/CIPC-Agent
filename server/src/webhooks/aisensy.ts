import express from 'express';
import crypto from 'crypto';
import { whatsappService } from '../../services/whatsappService.js';
import { aiOrchestrator } from '../../services/aiOrchestrator.js'; // Import the orchestrator

const router = express.Router();

function verifySignature(rawBody: Buffer, signatureHeader: string | undefined, secret: string): boolean {
  if (!signatureHeader || !rawBody || !secret) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

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

  // Use the raw body for signature verification
  if (!verifySignature(req.body, signature, secret)) {
    // @ts-ignore
    req.log.warn('Invalid AiSensy webhook signature received.');
    return res.status(401).send('Invalid signature');
  }

  try {
    // Now parse the verified body to get the message content
    const payload = JSON.parse(req.body.toString('utf8'));
    const parsedMessage = whatsappService.parseIncomingMessage(payload);

    if (parsedMessage && parsedMessage.message) {
      // @ts-ignore
      req.log.info({ from: parsedMessage.from, message: parsedMessage.message }, 'Routing incoming WhatsApp message to AI Orchestrator.');
      
      // Use the AI Orchestrator to process the user's intent
      const response = await aiOrchestrator.orchestrateTask(parsedMessage.message, { 
        platform: 'whatsapp', 
        userId: parsedMessage.from 
      });

      // Formulate a response from the agent's execution
      const replyMessage = response.success ? 
        (response.data?.response || 'Your request has been processed.') : 
        (response.error || 'Sorry, I could not process your request.');

      // Send the reply back to the user via WhatsApp
      await whatsappService.sendMessage({ to: parsedMessage.from, message: replyMessage, type: 'text' });

      res.status(200).json({ ok: true, message: "Event processed by orchestrator" });
    } else {
      res.status(200).json({ ok: true, message: "Event received but no action taken" });
    }
  } catch (error) {
    // @ts-ignore
    req.log.error({ err: error, body: req.body.toString('utf8') }, 'Error processing AiSensy webhook');
    res.status(500).send('Error processing webhook');
  }
});

export default router;
