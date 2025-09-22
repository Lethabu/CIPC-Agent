import express from 'express';
import { TypebotOrchestrator } from '../services/typebot-orchestrator';
import { AppConfig } from '../config';

export const createPrivateRouter = (orchestrator: TypebotOrchestrator, config: AppConfig) => {
  const router = express.Router();

  // This is a protected route, accessible only to authenticated users.
  router.get('/me', (req, res) => {
    // The 'req.user' object is attached by the 'authMiddleware'
    // and contains the decoded token information.
    res.status(200).json(req.user);
  });

  return router;
};
