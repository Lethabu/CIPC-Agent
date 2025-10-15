import { Router } from 'express';
import { Logger } from 'pino';
import { ImmediateActionService } from '../services/immediate-action.service';
import { ImmediateActionMiddleware, ActionRequest } from '../middleware/immediate-action.middleware';

export function createImmediateActionRouter(
  logger: Logger,
  actionService: ImmediateActionService
): Router {
  const router = Router();
  const middleware = new ImmediateActionMiddleware(logger, actionService);

  // Apply middleware
  router.use(middleware.createActionContext());

  // Execute immediate action
  router.post('/execute',
    middleware.validateAction(),
    middleware.executeAction()
  );

  // Get action result
  router.get('/result/:actionId', async (req, res) => {
    try {
      const { actionId } = req.params;
      const result = await actionService.getActionResult(actionId);
      
      if (!result) {
        return res.status(404).json({ error: 'Action result not found' });
      }

      res.json(result);
    } catch (error) {
      logger.error({ error, actionId: req.params.actionId }, 'Error fetching action result');
      res.status(500).json({ error: 'Failed to fetch action result' });
    }
  });

  // Get user action history
  router.get('/history', async (req: ActionRequest, res) => {
    try {
      const userId = req.actionContext?.userId || req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const history = await actionService.getActionHistory(userId, limit);
      
      res.json({ history });
    } catch (error) {
      logger.error({ error }, 'Error fetching action history');
      res.status(500).json({ error: 'Failed to fetch action history' });
    }
  });

  // Health check for immediate actions
  router.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'immediate-actions'
    });
  });

  return router;
}