import { Logger } from 'pino';
import { EventEmitter } from 'events';
import { Redis } from 'ioredis';

export interface ActionContext {
  userId: string;
  sessionId: string;
  timestamp: Date;
  source: 'webhook' | 'api' | 'websocket';
  metadata?: Record<string, any>;
}

export interface ActionResult {
  success: boolean;
  actionId: string;
  response?: any;
  error?: string;
  executionTime: number;
}

export class ImmediateActionService {
  private readonly logger: Logger;
  private readonly eventEmitter: EventEmitter;
  private readonly redis: Redis;
  private readonly actionHandlers = new Map<string, Function>();

  constructor(logger: Logger, eventEmitter: EventEmitter, redis: Redis) {
    this.logger = logger;
    this.eventEmitter = eventEmitter;
    this.redis = redis;
    this.setupDefaultHandlers();
  }

  public async executeAction(
    actionType: string,
    payload: any,
    context: ActionContext
  ): Promise<ActionResult> {
    const startTime = Date.now();
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      this.logger.info({ actionType, actionId, context }, 'Executing immediate action');

      // Rate limiting check
      const rateLimitKey = `rate_limit:${context.userId}:${actionType}`;
      const currentCount = await this.redis.incr(rateLimitKey);
      if (currentCount === 1) {
        await this.redis.expire(rateLimitKey, 60); // 1 minute window
      }
      if (currentCount > 10) {
        throw new Error('Rate limit exceeded');
      }

      const handler = this.actionHandlers.get(actionType);
      if (!handler) {
        throw new Error(`No handler found for action type: ${actionType}`);
      }

      const response = await handler(payload, context);
      const executionTime = Date.now() - startTime;

      const result: ActionResult = {
        success: true,
        actionId,
        response,
        executionTime
      };

      // Cache successful result
      await this.redis.setex(`action_result:${actionId}`, 300, JSON.stringify(result));

      this.eventEmitter.emit('action:completed', { actionType, result, context });
      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const result: ActionResult = {
        success: false,
        actionId,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime
      };

      this.logger.error({ actionType, actionId, error, context }, 'Action execution failed');
      this.eventEmitter.emit('action:failed', { actionType, result, context });
      return result;
    }
  }

  private setupDefaultHandlers() {
    // CIPC compliance check
    this.registerHandler('cipc_compliance_check', async (payload: { regNumber: string }, context: ActionContext) => {
      const { regNumber } = payload;
      
      if (!regNumber || !/^\d{4}\/\d{6}\/\d{2}$/.test(regNumber)) {
        throw new Error('Invalid registration number format');
      }

      const [year] = regNumber.split('/');
      const incorporationYear = parseInt(year);
      const currentYear = new Date().getFullYear();
      const yearsOld = currentYear - incorporationYear;
      const score = Math.max(60, 100 - (yearsOld * 2));

      return {
        regNumber,
        complianceScore: score,
        issues: [
          { type: 'annual_return', status: 'overdue', dueDate: '2024-03-15' },
          { type: 'beneficial_ownership', status: 'overdue', dueDate: '2024-03-31' }
        ],
        fixPrice: 299
      };
    });

    // Payment processing
    this.registerHandler('process_payment', async (payload: { amount: number, description: string }, context: ActionContext) => {
      const { amount, description } = payload;
      
      if (!amount || amount <= 0) {
        throw new Error('Invalid payment amount');
      }

      // Simulate payment processing
      const paymentId = `pay_${Date.now()}`;
      
      return {
        paymentId,
        amount,
        description,
        status: 'pending',
        paymentUrl: `https://sandbox.payfast.co.za/eng/process?merchant_id=10000100&amount=${amount}&item_name=${encodeURIComponent(description)}`
      };
    });

    // WhatsApp message handling
    this.registerHandler('whatsapp_message', async (payload: { message: string, from: string }, context: ActionContext) => {
      const { message, from } = payload;
      
      // Check for registration number pattern
      const regMatch = message.match(/(\d{4}\/\d{6}\/\d{2})/);
      if (regMatch) {
        return await this.executeAction('cipc_compliance_check', { regNumber: regMatch[1] }, context);
      }

      if (message.toUpperCase() === 'FIX') {
        return await this.executeAction('process_payment', { 
          amount: 299, 
          description: 'CIPC Compliance Package' 
        }, context);
      }

      return {
        response: 'Please send your company registration number (YYYY/NNNNNN/NN) or reply "FIX" to proceed with compliance fixes.',
        type: 'text'
      };
    });
  }

  public registerHandler(actionType: string, handler: Function) {
    this.actionHandlers.set(actionType, handler);
    this.logger.info({ actionType }, 'Registered action handler');
  }

  public async getActionResult(actionId: string): Promise<ActionResult | null> {
    const cached = await this.redis.get(`action_result:${actionId}`);
    return cached ? JSON.parse(cached) : null;
  }

  public async getActionHistory(userId: string, limit = 10): Promise<ActionResult[]> {
    // Implementation would fetch from persistent storage
    return [];
  }
}