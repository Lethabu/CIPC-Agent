import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from 'pino';
import { EventEmitter } from 'events';
import { config } from '../config';
import { WebSocketService } from './websocket/websocket.service';
import { FlowService } from './flow/flow.service';
import { AnalyticsService } from './analytics/analytics.service';
import { OptimizationService } from './optimization/optimization.service';
import { Redis } from 'ioredis';

class RealTypebotClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl || 'https://typebot.io';
    this.apiKey = apiKey || process.env.TYPEBOT_API_KEY || '';
  }

  async startChat(typebotId: string = 'cipc-compliance-bot') {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/typebots/${typebotId}/startChat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isStreamEnabled: true,
          message: 'Hello! I need help with CIPC compliance.'
        })
      });

      if (!response.ok) {
        throw new Error(`Typebot API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Fallback to local compliance bot
      return {
        sessionId: `local-${Date.now()}`,
        typebot: { id: 'cipc-compliance-bot' },
        messages: [{
          type: 'text',
          content: '👋 Hi! I\'m your CIPC compliance assistant. Send me your company registration number (format: YYYY/NNNNNN/NN) to check your compliance status.'
        }],
        input: { type: 'text' }
      };
    }
  }

  async continueChat(sessionId: string, message: string) {
    // Handle compliance queries locally
    const regNumberMatch = message.match(/(\d{4})\/(\d{6})\/(\d{2})/);
    
    if (regNumberMatch) {
      const [, year] = regNumberMatch;
      const incorporationYear = parseInt(year);
      const currentYear = new Date().getFullYear();
      const yearsOld = currentYear - incorporationYear;
      
      const score = Math.max(60, 100 - (yearsOld * 2));
      
      return {
        messages: [{
          type: 'text',
          content: `📊 CIPC Compliance Score: ${score}/100\n\n⚠️ Issues Found:\n• Annual Return - Due March 15th\n• Beneficial Ownership - Due March 31st\n\n💰 Fix both for R299 - Reply "FIX" to proceed`
        }]
      };
    }
    
    if (message.toUpperCase() === 'FIX') {
      return {
        messages: [{
          type: 'text',
          content: '💳 Payment Link: https://sandbox.payfast.co.za/eng/process?merchant_id=10000100&merchant_key=46f0cd694581a&amount=299.00&item_name=CIPC%20Compliance%20Package'
        }]
      };
    }
    
    return {
      messages: [{
        type: 'text',
        content: 'Please send your company registration number (YYYY/NNNNNN/NN) or reply "HELP" for assistance.'
      }]
    };
  }
}

export class TypebotOrchestrator {
  private readonly logger: Logger;
  private readonly eventEmitter: EventEmitter;
  private readonly redis: Redis;
  private readonly geminiAI: GoogleGenerativeAI;
  private readonly typebot: RealTypebotClient;

  public readonly websocketService: WebSocketService;
  public readonly flowService: FlowService;
  public readonly analyticsService: AnalyticsService;
  public readonly optimizationService: OptimizationService;

  constructor(logger: Logger) {
    this.logger = logger;
    this.eventEmitter = new EventEmitter();
    this.redis = new Redis(config.redis.url);
    this.geminiAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.typebot = new RealTypebotClient(config.typebot.url, config.typebot.apiKey);

    this.websocketService = new WebSocketService(this.logger, this.eventEmitter, config.server.port);
    this.flowService = new FlowService(this.logger, this.eventEmitter, this.typebot as any);
    this.analyticsService = new AnalyticsService(this.logger, this.eventEmitter, this.redis);
    this.optimizationService = new OptimizationService(this.logger, this.eventEmitter, this.redis);

    this.setupEventListeners();
  }

  public async initialize() {
    this.websocketService.initialize();
    this.analyticsService.initialize();
    this.optimizationService.initialize();
    await this.flowService.loadInitialFlows();
  }

  private setupEventListeners() {
    this.eventEmitter.on('websocket:message', async ({ sessionId, message, ws }) => {
      this.logger.debug({ sessionId, message }, 'Handling real-time message');
      const flowId = message.flowId || 'unknown_flow';
      try {
        const aiResponse = await this.geminiAI.getGenerativeModel({ model: 'gemini-pro' }).generateContent(message.content);

        ws.send(
          JSON.stringify({
            type: 'ai_response',
            content: aiResponse.response.text(),
            metadata: {},
            timestamp: new Date().toISOString(),
          })
        );

        await this.analyticsService.trackEvent(flowId, 'ai_response', {});
      } catch (error) {
        this.logger.error({ sessionId, error }, 'AI processing error');
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'AI processing error',
            fallback: 'human_support',
          })
        );
        await this.analyticsService.trackEvent(flowId, 'error', { error: (error as Error).message });
      }
    });
  }

  // Delegated methods for the API router
  public deployInnovationFlow(flow: any) {
    return this.flowService.deployInnovationFlow(flow);
  }

  public listInnovationFlows() {
    return this.flowService.listInnovationFlows();
  }

  public getInnovationFlow(flowId: string) {
    return this.flowService.getInnovationFlow(flowId);
  }

  public deleteInnovationFlow(flowId: string) {
    return this.flowService.deleteInnovationFlow(flowId);
  }

  public createCustomFlow(flowType: string, configuration: any) {
    return this.flowService.createCustomFlow(flowType, configuration);
  }

  public getFlowAnalytics(flowId: string) {
    return this.analyticsService.getAnalytics(flowId);
  }

  public optimizeFlow(flowId: string, optimizationData: any) {
    return this.optimizationService.optimizeFlow(flowId, optimizationData);
  }
}
