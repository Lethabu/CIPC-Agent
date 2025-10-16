import { Request, Response } from 'express';
import { TemporalClient } from '../services/temporal-client';

interface TypebotWebhook {
  sessionId: string;
  userId: string;
  message: string;
  variables: Record<string, any>;
  flow: string;
}

export class TypebotHandler {
  private temporal: TemporalClient;

  constructor() {
    this.temporal = new TemporalClient();
  }

  async handleOnboarding(req: Request, res: Response) {
    const data: TypebotWebhook = req.body;
    
    try {
      await this.temporal.startWorkflow('OnboardingWorkflow', {
        user_id: data.userId,
        company_id: data.variables.companyId,
        data: data.variables
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async handleFiling(req: Request, res: Response) {
    const data: TypebotWebhook = req.body;
    
    try {
      await this.temporal.startWorkflow('FilingWorkflow', {
        company_id: data.variables.companyId,
        type: data.variables.filingType,
        data: data.variables
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async handleSupport(req: Request, res: Response) {
    const data: TypebotWebhook = req.body;
    
    // AI-powered support response
    const response = await this.generateSupportResponse(data.message);
    
    res.json({ 
      success: true,
      response: response
    });
  }

  private async generateSupportResponse(message: string): Promise<string> {
    // Simplified AI response
    if (message.toLowerCase().includes('deadline')) {
      return 'Your next compliance deadline is in 30 days. Would you like me to help you prepare?';
    }
    return 'I understand your query. Let me connect you with the right agent.';
  }
}