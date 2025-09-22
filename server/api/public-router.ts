import express from 'express';
import { TypebotOrchestrator } from '../services/typebot-orchestrator';
import { AppConfig } from '../config';

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

  return router;
};
