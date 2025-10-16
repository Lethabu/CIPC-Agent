import { Client, Connection } from '@temporalio/client';

export class TemporalClient {
  private client: Client;

  constructor() {
    this.init();
  }

  private async init() {
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_HOST_PORT || 'localhost:7233',
    });

    this.client = new Client({
      connection,
      namespace: 'cipc-agent-ns',
    });
  }

  async startWorkflow(workflowType: string, args: any) {
    const handle = await this.client.workflow.start(workflowType, {
      args: [args],
      taskQueue: 'CIPC_TASK_QUEUE',
      workflowId: `${workflowType}-${Date.now()}`,
    });

    return handle;
  }

  async getWorkflowStatus(workflowId: string) {
    const handle = this.client.workflow.getHandle(workflowId);
    return await handle.describe();
  }
}