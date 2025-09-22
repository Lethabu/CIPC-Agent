import { nanoid } from 'nanoid';
import { Logger } from 'pino';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

export class FlowService {
  private innovationFlows: Map<string, any>;

  constructor(
    private readonly logger: Logger,
    private readonly eventEmitter: EventEmitter,
    private readonly typebot: any // Changed from TypebotClient to any
  ) {
    this.innovationFlows = new Map();
  }

  public async loadInitialFlows() {
    this.logger.info('Loading innovation flows...');
    const flowsDir = path.join(__dirname, '../flows');
    if (!fs.existsSync(flowsDir)) {
        this.logger.warn(`Flows directory not found at ${flowsDir}. Skipping initial flow loading.`);
        return;
    }
    const flowFiles = fs.readdirSync(flowsDir).filter(file => file.endsWith('.ts'));

    for (const file of flowFiles) {
      const flow = require(path.join(flowsDir, file));
      await this.deployInnovationFlow(flow.default);
    }
    this.logger.info('Innovation flows loaded.');
  }

  public async deployInnovationFlow(flow: any): Promise<any> {
    try {
      this.logger.info({ flowId: flow.id }, 'Deploying innovation flow...');
      // In a real scenario, this would interact with the Typebot service
      const typebotDeployment = { id: `dep-${nanoid()}`, publicUrl: `https://typebot.io/v/${flow.id}` };

      this.eventEmitter.emit('flow:register', flow);
      this.eventEmitter.emit('flow:monitor', flow);
      this.eventEmitter.emit('flow:analytics', flow);

      this.innovationFlows.set(flow.id, flow);

      this.logger.info({ flowId: flow.id, deploymentId: typebotDeployment.id }, 'Innovation flow deployed successfully.');

      return {
        success: true,
        flowId: flow.id,
        deploymentId: typebotDeployment.id,
        publicUrl: typebotDeployment.publicUrl,
        analyticsUrl: `https://analytics.cipcagent.co.za/flows/${flow.id}`,
        websocketUrl: `wss://ws.cipcagent.co.za/flows/${flow.id}`,
      };
    } catch (error: any) {
      this.logger.error({ flowId: flow.id, error: error.message }, 'Innovation flow deployment failed.');
      throw new Error(`Innovation flow deployment failed: ${error.message}`);
    }
  }

  public listInnovationFlows(): any[] {
    return Array.from(this.innovationFlows.values());
  }

  public getInnovationFlow(flowId: string): any {
    return this.innovationFlows.get(flowId);
  }

  public deleteInnovationFlow(flowId: string): boolean {
    return this.innovationFlows.delete(flowId);
  }

  public createCustomFlow(flowType: string, configuration: any): any {
    this.logger.info({ flowType }, 'Creating custom flow');
    const flowId = `custom-flow-${nanoid()}`;
    return { id: flowId, name: flowType, ...configuration };
  }
}
