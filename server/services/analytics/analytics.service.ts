import { Redis } from 'ioredis';
import { Logger } from 'pino';
import { EventEmitter } from 'events';

export class AnalyticsService {
  constructor(
    private readonly logger: Logger,
    private readonly eventEmitter: EventEmitter,
    private readonly redis: Redis
  ) {}

  public initialize() {
    this.eventEmitter.on('event:track', async ({ flowId, eventType, data }) => {
      this.logger.info({ flowId, eventType, data }, 'Tracking real-time event.');
      await this.redis.hincrby(`analytics:${flowId}`, eventType, 1);
    });
  }

  public async getAnalytics(flowId: string): Promise<any> {
    this.logger.debug({ flowId }, 'Fetching flow analytics');
    const analytics = await this.redis.hgetall(`analytics:${flowId}`);
    return { flowId, analytics };
  }

    public async trackEvent(flowId: string, eventType: string, data: any) {
    this.eventEmitter.emit('event:track', { flowId, eventType, data });
  }
}
