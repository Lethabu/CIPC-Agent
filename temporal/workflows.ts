// These are definitions for workflows implemented in Go.
// We use them to have type safety in our TypeScript code when starting workflows.

export const AIWhatsAppWorkflow = 'AIWhatsAppWorkflow';
export const OnboardingWorkflow = 'OnboardingWorkflow';
export const FilingWorkflow = 'FilingWorkflow';
export const ComplianceCheckWorkflow = 'ComplianceCheckWorkflow';
export const PaymentRecoveryWorkflow = 'PaymentRecoveryWorkflow';


export interface FilingWorkflowParams {
  UserPhone: string;
  CompanyRegNum: string;
  ServiceType: string;
  Documents: string[];
}
