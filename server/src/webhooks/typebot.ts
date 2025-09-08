import express, { Router, Request, Response } from 'express';

const router = Router();

router.post(
  '/',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    try {
      res.status(200).json({ ok: true, message: 'Event processed successfully.' });
    } catch (error) {
      console.error({ err: error }, 'Error processing Typebot webhook in the main handler.');
      res.status(500).send('An unexpected error occurred.');
    }
  }
);

export default router;
