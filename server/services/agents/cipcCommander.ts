import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AgentTask, AgentResponse } from "../aiOrchestrator.js";
import { complianceCopilotAgent } from "./complianceCopilot.js"; // Import the new agent

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export class CipcCommander {

  async routeTask(userIntent: string, userData?: any): Promise<AgentTask> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
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
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      const task = JSON.parse(text) as { agent_name: string, task: string, priority: "high"|"medium"|"low", data?: any };
      
      return {
        agentName: task.agent_name || "cipc_commander",
        task: task.task || userIntent,
        priority: task.priority || "medium",
        data: { ...task.data, ...userData }
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
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const prompt = `
    You are the CIPC Commander, helping South African SMMEs with compliance.
    
    Task: ${task}
    User Data: ${JSON.stringify(data || {})}
    
    Provide helpful guidance about CIPC compliance, deadlines, and next steps.
    Be conversational and professional. If you need more information, ask specific questions.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      return {
        success: true,
        data: {
          response: text,
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
