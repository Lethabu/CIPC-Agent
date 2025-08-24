import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { CipcCommander } from "./agents/cipcCommander";
import { leadScoutAgent } from "./agents/leadScout";
import { kycOnboarderAgent } from "./agents/kycOnboarder";
import { formAutopilotAgent, CipcSubmissionResult } from "./agents/formAutopilot";
import { regulationSentinelAgent } from "./agents/regulationSentinel";
import { paymentRunnerAgent } from "./agents/paymentRunner";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "" });
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_ENV_VAR || "" });

export interface AgentTask {
  agentName: string;
  task: string;
  priority: "high" | "medium" | "low";
  data?: any;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  nextAgent?: string;
}

export class AIOrchestrator {
  private cipcCommander: CipcCommander;

  constructor() {
    this.cipcCommander = new CipcCommander(openai, gemini);
  }

  async orchestrateTask(userIntent: string, userData?: any): Promise<AgentResponse> {
    try {
      // Use CIPC Commander to determine which agent should handle the task
      const routing = await this.cipcCommander.routeTask(userIntent, userData);
      
      // Handle directly with CIPC Commander for now
      return await this.cipcCommander.execute(routing.task, routing.data);
    } catch (error) {
      return {
        success: false,
        error: `Orchestration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async routeTask(taskType: string, payload: any) {
    try {
      switch (taskType) {
        case 'generate_beneficial_ownership_form':
          return await formAutopilotAgent.generateBeneficialOwnershipForm(payload);
        
        case 'submit_cipc_form':
          return (await formAutopilotAgent.submitForm(payload)) as CipcSubmissionResult;
        
        case 'check_beneficial_ownership_compliance':
          return await regulationSentinelAgent.checkBeneficialOwnershipCompliance(payload.companyId);
        
        case 'get_beneficial_ownership_cost':
          return await paymentRunnerAgent.getBeneficialOwnershipFilingCost();
        
        default:
          return { success: false, error: 'Unknown task type' };
      }
    } catch (error) {
      console.error(`Task routing error for ${taskType}:`, error);
      return { success: false, error: 'Task execution failed' };
    }
  }

  async getAgentStatus(): Promise<Record<string, boolean>> {
    return {
      cipc_commander: true,
      lead_scout: true,
      kyc_onboarder: true,
      form_autopilot: true,
      regulation_sentinel: true,
      payment_runner: true
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();
