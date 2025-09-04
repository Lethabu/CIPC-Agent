import { Connection, Client } from '@temporalio/client';
import { AIWhatsAppWorkflow, OnboardingWorkflow, FilingWorkflow, FilingWorkflowParams, PaymentRecoveryWorkflow, ComplianceMonitoringWorkflow } from '../../temporal/workflows';

let temporalClient: Client;

async function getClient(): Promise<Client> {
  if (temporalClient) {
    return temporalClient;
  }

  const connection = await Connection.connect(); // Connects to localhost:7233 by default
  temporalClient = new Client({
    connection,
    namespace: 'cipc-agent-ns', // As per your masterbuild
  });

  return temporalClient;
}

/**
 * Starts the AIWhatsAppWorkflow to handle an incoming message.
 */
export async function startAIWhatsAppWorkflow(phoneNumber: string, message: string): Promise<string> {
  const client = await getClient();
  const workflowId = `whatsapp-${phoneNumber}-${Date.now()}`;

  await client.workflow.start(AIWhatsAppWorkflow, {
    taskQueue: 'CIPC_TASK_QUEUE',
    workflowId,
    args: [phoneNumber, message],
  });

  console.log(`Started AIWhatsAppWorkflow: ${workflowId}`);
  return workflowId;
}

/**
 * Starts the OnboardingWorkflow for a new user.
 */
export async function startOnboardingWorkflow(phoneNumber: string, initialMessage: string): Promise<string> {
  const client = await getClient();
  const workflowId = `onboarding-${phoneNumber}-${Date.now()}`;

  await client.workflow.start(OnboardingWorkflow, {
    taskQueue: 'CIPC_TASK_QUEUE',
    workflowId,
    args: [phoneNumber, initialMessage],
  });

  console.log(`Started OnboardingWorkflow: ${workflowId}`);
  return workflowId;
}

/**
 * Starts the core FilingWorkflow for services like Annual Returns.
 */
export async function startFilingWorkflow(params: FilingWorkflowParams): Promise<string> {
  const client = await getClient();
  const workflowId = `filing-${params.CompanyRegNum}-${params.ServiceType}-${Date.now()}`;

  await client.workflow.start(FilingWorkflow, {
    taskQueue: 'CIPC_TASK_QUEUE',
    workflowId,
    args: [params],
  });

  console.log(`Started FilingWorkflow: ${workflowId}`);
  return workflowId;
}

/**
 * Starts the PaymentRecoveryWorkflow to handle stuck transactions.
 */
export async function startPaymentRecoveryWorkflow(transactionId: string, userPhone: string): Promise<string> {
  const client = await getClient();
  const workflowId = `payment-recovery-${transactionId}`;

  await client.workflow.start(PaymentRecoveryWorkflow, {
    taskQueue: 'CIPC_TASK_QUEUE',
    workflowId,
    args: [transactionId, userPhone],
  });

  console.log(`Started PaymentRecoveryWorkflow: ${workflowId}`);
  return workflowId;
}

/**
 * Starts the eternal ComplianceMonitoringWorkflow as a cron job.
 * This function is idempotent and should be called on application startup.
 */
export async function startComplianceMonitoringWorkflow(schedule: string = '0 0 * * *'): Promise<void> { // Default to daily at midnight
  const client = await getClient();
  const workflowId = 'compliance-monitoring-singleton'; // A fixed ID to ensure only one instance

  // Using start with a cron schedule acts as an "upsert".
  // It will start the workflow if it's not already running.
  await client.workflow.start(ComplianceMonitoringWorkflow, {
    taskQueue: 'CIPC_TASK_QUEUE', // This could be a dedicated, low-priority queue
    workflowId,
    cronSchedule: schedule,
  });

  console.log(`Ensured ComplianceMonitoringWorkflow (${workflowId}) is scheduled.`);
}
