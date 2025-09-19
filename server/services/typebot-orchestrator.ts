import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from 'pino';
import { EventEmitter } from 'events';
import { config } from '../config';
import { WebSocketService } from './websocket/websocket.service';
import { FlowService } from './flow/flow.service';
import { AnalyticsService } from './analytics/analytics.service';
import { OptimizationService } from './optimization/optimization.service';
import { Redis } from 'ioredis';

class MockTypebotClient {
  constructor() {}
  async startChat() {
    return {
      sessionId: 'mock-session-id',
      typebot: {
        id: 'mock-typebot-id',
        theme: {},
        settings: {},
        variables: [],
        groups: [],
        events: [],
      },
      messages: [],
      input: {
        type: 'text',
      },
    };
  }
}

export class TypebotOrchestrator {
  private readonly logger: Logger;
  private readonly eventEmitter: EventEmitter;
  private readonly redis: Redis;
  private readonly geminiAI: GoogleGenerativeAI;
  private readonly typebot: MockTypebotClient;

  public readonly websocketService: WebSocketService;
  public readonly flowService: FlowService;
  public readonly analyticsService: AnalyticsService;
  public readonly optimizationService: OptimizationService;

  constructor(logger: Logger) {
    this.logger = logger;
    this.eventEmitter = new EventEmitter();
    this.redis = new Redis(config.redis.url);
    this.geminiAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.typebot = new MockTypebotClient();

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
