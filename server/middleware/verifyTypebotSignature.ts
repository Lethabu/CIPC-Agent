import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const verifyTypebotSignature = (req: Request, res: Response, next: NextFunction) => {
  const secret = process.env.TYPEBOT_WEBHOOK_SECRET;
  if (!secret) {
    console.error('TYPEBOT_WEBHOOK_SECRET is not configured.');
    return res.status(500).send('Webhook secret not configured on server.');
  }

  const signature = req.headers['x-typebot-signature'] as string | undefined;
  const rawBody = req.body;

  if (!signature || !rawBody || !Buffer.isBuffer(rawBody)) {
    console.warn('Typebot webhook request is missing signature or body, or body is not a Buffer.');
    return res.status(400).send('Bad Request: Missing signature or body.');
  }

  try {
    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (!crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
      console.warn('Invalid Typebot webhook signature.');
      return res.status(403).send('Forbidden: Invalid signature.');
    }

    req.body = JSON.parse(rawBody.toString('utf8'));
    return next();

  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn({ err: error }, 'Error parsing Typebot webhook body as JSON.');
      return res.status(400).send('Bad Request: Invalid JSON format.');
    }
    console.error({ err: error }, 'Unexpected error during Typebot signature verification.');
    return res.status(500).send('Internal Server Error during verification.');
  }
};
