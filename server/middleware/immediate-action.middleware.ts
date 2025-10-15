import { Request, Response, NextFunction } from 'express';
import { Logger } from 'pino';
import { ImmediateActionService, ActionContext } from '../services/immediate-action.service';

export interface ActionRequest extends Request {
  actionContext?: ActionContext;
}

export class ImmediateActionMiddleware {
  constructor(
    private readonly logger: Logger,
    private readonly actionService: ImmediateActionService
  ) {}

  public createActionContext() {
    return (req: ActionRequest, res: Response, next: NextFunction) => {
      const userId = req.user?.uid || 'anonymous';
      const sessionId = req.sessionID || `session_${Date.now()}`;
      
      req.actionContext = {
        userId,
        sessionId,
        timestamp: new Date(),
        source: this.determineSource(req),
        metadata: {
          userAgent: req.get('User-Agent'),
          ip: req.ip,
          path: req.path
        }
      };

      this.logger.debug({ actionContext: req.actionContext }, 'Created action context');
      next();
    };
  }

  public validateAction() {
    return (req: ActionRequest, res: Response, next: NextFunction) => {
      const { actionType, payload } = req.body;

      if (!actionType) {
        return res.status(400).json({
          error: 'Missing actionType in request body'
        });
      }

      if (!req.actionContext) {
        return res.status(500).json({
          error: 'Action context not initialized'
        });
      }

      next();
    };
  }

  public executeAction() {
    return async (req: ActionRequest, res: Response, next: NextFunction) => {
      try {
        const { actionType, payload } = req.body;
        const context = req.actionContext!;

        const result = await this.actionService.executeAction(actionType, payload, context);

        if (result.success) {
          res.status(200).json({
            success: true,
            actionId: result.actionId,
            data: result.response,
            executionTime: result.executionTime
          });
        } else {
          res.status(400).json({
            success: false,
            actionId: result.actionId,
            error: result.error,
            executionTime: result.executionTime
          });
        }
      } catch (error) {
        this.logger.error({ error }, 'Action execution middleware error');
        res.status(500).json({
          error: 'Internal server error during action execution'
        });
      }
    };
  }

  private determineSource(req: Request): 'webhook' | 'api' | 'websocket' {
    if (req.path.includes('/webhook')) return 'webhook';
    if (req.path.includes('/ws') || req.headers.upgrade === 'websocket') return 'websocket';
    return 'api';
  }
}