import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CipcCommander } from "./agents/cipcCommander.js";
import { leadScoutAgent } from "./agents/leadScout.js";
import { kycOnboarderAgent } from "./agents/kycOnboarder.js";
import { complianceCopilotAgent } from "./agents/complianceCopilot.js";
import { formAutopilotAgent } from "./agents/formAutopilot.js";
import { regulationSentinelAgent } from "./agents/regulationSentinel.js";
import { paymentRunnerAgent } from "./agents/paymentRunner.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "" });
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_ENV_VAR || "");

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
      // 1. Use CIPC Commander to determine which agent and task is needed
      const agentTask = await this.cipcCommander.routeTask(userIntent, userData);
      
      // 2. Delegate the actual execution to the appropriate agent
      return await this.executeAgentTask(agentTask);
    } catch (error) {
      console.error(`Orchestration failed for intent "${userIntent}":`, error);
      return {
        success: false,
        error: `Orchestration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async executeAgentTask(agentTask: AgentTask): Promise<AgentResponse> {
    try {
      console.log(`Executing task "${agentTask.task}" with agent "${agentTask.agentName}"`);

      let agentResult: any;

      switch (agentTask.agentName) {
        case 'lead_scout':
          // Assuming a generic execute method until the agent's interface is confirmed
          return { success: false, error: 'lead_scout agent not fully implemented' };
        
        case 'kyc_onboarder':
          // Assuming a generic execute method until the agent's interface is confirmed
          return { success: false, error: 'kyc_onboarder agent not fully implemented' };

        case 'compliance_copilot':
          if (agentTask.task === 'validate_submission_data') {
            agentResult = await complianceCopilotAgent.validateData(agentTask.data);
          }
          break;

        case 'form_autopilot':
          if (agentTask.task === 'generate_beneficial_ownership_form') {
            agentResult = await formAutopilotAgent.generateBeneficialOwnershipForm(agentTask.data);
          } else if (agentTask.task === 'submit_cipc_form') {
            agentResult = await formAutopilotAgent.submitForm(agentTask.data);
          }
          break;

        case 'regulation_sentinel':
          if (agentTask.task === 'check_beneficial_ownership_compliance' && agentTask.data.companyId) {
            agentResult = await regulationSentinelAgent.checkBeneficialOwnershipCompliance(agentTask.data.companyId);
          }
          break;

        case 'payment_runner':
          if (agentTask.task === 'get_beneficial_ownership_cost') {
            agentResult = await paymentRunnerAgent.getBeneficialOwnershipFilingCost();
          }
          break;
          
        case 'cipc_commander':
        default:
          // If the commander routes to itself, or for any unhandled agent, use the commander's generic execute
          return await this.cipcCommander.execute(agentTask.task, agentTask.data);
      }

      // If a task within an agent is supported but the condition not met (e.g. missing data)
      if ([
        'regulation_sentinel', 
        'compliance_copilot', 
        'form_autopilot', 
        'payment_runner'
      ].includes(agentTask.agentName)) {

        if (agentResult) {
            return { success: true, data: agentResult };
        } else {
            return { success: false, error: `Invalid data for task "${agentTask.task}" in agent "${agentTask.agentName}"` };
        }

      }
      
      // If a task within an agent is not found
      return { success: false, error: `Agent "${agentTask.agentName}" does not support task "${agentTask.task}"` };

    } catch (error) {
      console.error(`Task execution error for agent ${agentTask.agentName}:`, error);
      return { success: false, error: `Task execution failed for agent ${agentTask.agentName}` };
    }
  }

  async getAgentStatus(): Promise<Record<string, boolean>> {
    return {
      cipc_commander: true,
      lead_scout: true,
      kyc_onboarder: true,
      compliance_copilot: true,
      form_autopilot: true,
      regulation_sentinel: true,
      payment_runner: true
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();
