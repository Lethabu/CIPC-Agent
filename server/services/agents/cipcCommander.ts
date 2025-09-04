import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AgentTask, AgentResponse } from "../aiOrchestrator.js";
import { complianceCopilotAgent } from "./complianceCopilot.js"; // Import the new agent

export class CipcCommander {
  constructor(private openai: OpenAI, private gemini: GoogleGenerativeAI) {}

  async routeTask(userIntent: string, userData?: any): Promise<AgentTask> {
    const prompt = `
    <ROLE>You are the CIPC Compliance Orchestrator for South African SMMEs</ROLE>
    <TASK>Delegate tasks based on user intent: 
    1. New lead generation → Route to lead_scout
    2. Document upload/processing → Route to kyc_onboarder
    3. Data validation → Route to compliance_copilot
    4. Form generation/filing → Route to form_autopilot
    5. Compliance deadline/alert → Route to regulation_sentinel
    6. Payment/submission → Route to payment_runner
    7. General queries → Handle directly</TASK>
    <INPUT>User Intent: ${userIntent}</INPUT>
    <OUTPUT>JSON with {agent_name: string, task: string, priority: "high"|"medium"|"low", data?: any}</OUTPUT>
    <CONSTRAINTS>Never process documents without POPIA compliance checks. Always prioritize user data security.</CONSTRAINTS>
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: prompt
          },
          {
            role: "user", 
            content: userIntent
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        agentName: result.agent_name || "cipc_commander",
        task: result.task || userIntent,
        priority: result.priority || "medium",
        data: { ...result.data, ...userData }
      };
    } catch (error) {
      // Fallback routing
      return {
        agentName: "cipc_commander",
        task: userIntent,
        priority: "medium",
        data: userData
      };
    }
  }

  async execute(task: string, data?: any): Promise<AgentResponse> {
    const prompt = `
    You are the CIPC Commander, helping South African SMMEs with compliance.
    
    Task: ${task}
    User Data: ${JSON.stringify(data || {})}
    
    Provide helpful guidance about CIPC compliance, deadlines, and next steps.
    Be conversational and professional. If you need more information, ask specific questions.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful CIPC compliance expert for South African SMMEs. Be professional yet conversational."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return {
        success: true,
        data: {
          response: response.choices[0].message.content,
          agent: "CIPC Commander"
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `CIPC Commander error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
