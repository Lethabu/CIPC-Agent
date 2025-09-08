import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// This middleware assumes that a raw body parser (like express.raw()) has been used.
export const verifyAisensySignature = (req: Request, res: Response, next: NextFunction) => {
  const secret = process.env.AISENSY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('AISENSY_WEBHOOK_SECRET is not configured.');
    return res.status(500).send('Webhook secret not configured on server.');
  }

  const signature = req.headers['x-aisensy-signature'] as string | undefined;
  const rawBody = req.body;

  if (!signature || !rawBody || !Buffer.isBuffer(rawBody)) {
    console.warn('Aisensy webhook request is missing signature or body, or body is not a Buffer.');
    return res.status(400).send('Bad Request: Missing signature or body.');
  }

  try {
    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (!crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
      console.warn('Invalid AiSensy webhook signature.');
      return res.status(403).send('Forbidden: Invalid signature.');
    }

    // Verification successful. Now, parse the body and replace the raw buffer with the JSON object.
    req.body = JSON.parse(rawBody.toString('utf8'));
    return next();

  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn({ err: error }, 'Error parsing Aisensy webhook body as JSON.');
      return res.status(400).send('Bad Request: Invalid JSON format.');
    }
    console.error({ err: error }, 'Unexpected error during Aisensy signature verification.');
    return res.status(500).send('Internal Server Error during verification.');
  }
};
