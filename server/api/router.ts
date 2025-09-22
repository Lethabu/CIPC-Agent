import express from 'express';
import { TypebotOrchestrator } from '../services/typebot-orchestrator';
import { authMiddleware } from './middleware/auth';
import { createPublicRouter } from './public-router';
import { createPrivateRouter } from './private-router';
import { AppConfig } from '../config';

export const createApiRouter = (orchestrator: TypebotOrchestrator, config: AppConfig) => {
  const router = express.Router();

  const publicRouter = createPublicRouter(orchestrator, config);
  const privateRouter = createPrivateRouter(orchestrator, config);

  router.use('/api', publicRouter);
  router.use('/api', authMiddleware, privateRouter);

  return router;
};
