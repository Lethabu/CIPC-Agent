import { Request, Response } from 'express';
import { Logger } from 'pino';
import { ImmediateActionService, ActionContext } from '../services/immediate-action.service';

export class ImmediateWebhookHandler {
  constructor(
    private readonly logger: Logger,
    private readonly actionService: ImmediateActionService
  ) {}

  public async handleWhatsAppWebhook(req: Request, res: Response) {
    try {
      const { message, from, timestamp } = req.body;

      if (!message || !from) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const context: ActionContext = {
        userId: from,
        sessionId: `whatsapp_${from}_${Date.now()}`,
        timestamp: new Date(timestamp || Date.now()),
        source: 'webhook',
        metadata: {
          platform: 'whatsapp',
          messageId: req.body.messageId
        }
      };

      const result = await this.actionService.executeAction(
        'whatsapp_message',
        { message, from },
        context
      );

      if (result.success) {
        // Send immediate response back to WhatsApp
        res.status(200).json({
          response: result.response?.response || 'Message processed',
          actionId: result.actionId
        });
      } else {
        res.status(500).json({
          error: 'Failed to process message',
          actionId: result.actionId
        });
      }

    } catch (error) {
      this.logger.error({ error }, 'WhatsApp webhook error');
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async handleTypebotWebhook(req: Request, res: Response) {
    try {
      const { sessionId, message, userId } = req.body;

      const context: ActionContext = {
        userId: userId || 'anonymous',
        sessionId: sessionId || `typebot_${Date.now()}`,
        timestamp: new Date(),
        source: 'webhook',
        metadata: {
          platform: 'typebot'
        }
      };

      // Determine action type based on message content
      let actionType = 'whatsapp_message';
      if (message.includes('payment') || message.includes('pay')) {
        actionType = 'process_payment';
      }

      const result = await this.actionService.executeAction(
        actionType,
        { message, from: userId },
        context
      );

      res.status(200).json({
        success: result.success,
        response: result.response,
        actionId: result.actionId
      });

    } catch (error) {
      this.logger.error({ error }, 'Typebot webhook error');
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async handlePaymentWebhook(req: Request, res: Response) {
    try {
      const { payment_status, m_payment_id, amount_gross } = req.body;

      const context: ActionContext = {
        userId: req.body.custom_str1 || 'system',
        sessionId: `payment_${m_payment_id}`,
        timestamp: new Date(),
        source: 'webhook',
        metadata: {
          platform: 'payfast',
          paymentId: m_payment_id
        }
      };

      const result = await this.actionService.executeAction(
        'payment_status_update',
        {
          paymentId: m_payment_id,
          status: payment_status,
          amount: amount_gross
        },
        context
      );

      res.status(200).json({
        success: result.success,
        actionId: result.actionId
      });

    } catch (error) {
      this.logger.error({ error }, 'Payment webhook error');
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}