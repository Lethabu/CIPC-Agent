import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export class RegulationSentinelAgent {
  name = "Regulation Sentinel";
  description = "AI agent specialized in monitoring CIPC regulations and compliance deadlines";

  async checkBeneficialOwnershipCompliance(companyId: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const prompt = `
    <ROLE>You are the CIPC Regulation Sentinel, an AI expert on compliance deadlines.</ROLE>
    <TASK>Check the beneficial ownership compliance status for a company with the ID: ${companyId}. You must determine the last filing date and calculate the next due date. Your response must be in JSON format.</TASK>
    <OUTPUT_FORMAT>{
      "companyId": string,
      "lastFilingDate": string, // ISO 8601 format
      "nextDueDate": string, // ISO 8601 format
      "status": "compliant" | "due_soon" | "overdue",
      "riskLevel": "low" | "medium" | "high",
      "daysUntilDue": number
    }</OUTPUT_FORMAT>
    <CONSTRAINTS>Your calculations must be precise. Assume an annual filing requirement for beneficial ownership. If a company is new, the first filing is due within 6 months of incorporation.</CONSTRAINTS>
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      const complianceData = JSON.parse(text);

      return {
        status: "checked",
        compliance: complianceData,
        alerts: complianceData.daysUntilDue <= 60 ? [{
          type: "beneficial_ownership_due",
          urgency: complianceData.daysUntilDue <= 30 ? "high" : "medium",
          message: `Beneficial ownership filing due in ${complianceData.daysUntilDue} days`,
          dueDate: complianceData.nextDueDate,
          recommendedAction: "File COR46 form immediately",
        }] : [],
        recommendations: [
          "Update beneficial ownership information",
          "Verify director details",
          "Prepare COR46 filing",
        ],
      };
    } catch (error) {
      console.error("Error checking compliance with Generative AI:", error);
      return {
        status: "error",
        error: "Failed to check beneficial ownership compliance.",
      };
    }
  }

  async getComplianceCalendar(companyRegistrationNumber: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    // In a real-world scenario, you would first look up the company's incorporation date via an API.
    const prompt = `
    <ROLE>You are the CIPC Regulation Sentinel, an AI expert on compliance schedules.</ROLE>
    <TASK>Generate a 12-month compliance calendar for a South African company with registration number ${companyRegistrationNumber}. Assume today's date is ${new Date().toISOString()}. The calendar should include deadlines for Annual Return, Beneficial Ownership, and Annual Financial Statement submissions. Your response must be in JSON format.</TASK>
    <OUTPUT_FORMAT>{
      "companyRegistrationNumber": string,
      "upcomingDeadlines": Array<{
        "type": "annual_return" | "beneficial_ownership" | "afs_submission",
        "formType": string,
        "dueDate": string, // ISO 8601 format
        "status": "pending"
      }>
    }</OUTPUT_FORMAT>
    <CONSTRAINTS>Base deadlines on standard CIPC regulations (e.g., Annual Return due on the anniversary of incorporation, Beneficial Ownership filing annually).</CONSTRAINTS>
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      return JSON.parse(text);
    } catch (error) {
      console.error("Error generating compliance calendar with Generative AI:", error);
      return {
        status: "error",
        error: "Failed to generate compliance calendar.",
      };
    }
  }

  async calculateUrgencyFee(daysUntilDue: number): Promise<number> {
    if (daysUntilDue < 7) {
      return 0.50; // 50% urgency fee for filings within a week
    }
    if (daysUntilDue < 30) {
      return 0.25; // 25% urgency fee for filings within a month
    }
    return 0; // No urgency fee
  }

  async monitorRegulationChanges() {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const prompt = `
    <ROLE>You are the CIPC Regulation Sentinel, an AI expert on regulatory changes.</ROLE>
    <TASK>Provide a summary of the latest amendments to the South African Companies Act and any upcoming changes relevant to CIPC compliance. Your response must be in JSON format.</TASK>
    <OUTPUT_FORMAT>{
      "recentChanges": Array<{
        "regulation": string,
        "effectiveDate": string, // ISO 8601 format
        "summary": string,
        "impact": "high" | "medium" | "low"
      }>,
      "upcomingChanges": Array<{
        "regulation": string,
        "expectedDate": string, // ISO 8601 format
        "summary": string,
        "impact": "high" | "medium" | "low"
      }>
    }</OUTPUT_FORMAT>
    <CONSTRAINTS>Focus on changes within the last 12 months and those expected in the next 12 months. Ensure the information is accurate and concise.</CONSTRAINTS>
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      const regulationChanges = JSON.parse(text);

      return {
        status: "monitoring",
        ...regulationChanges,
      };
    } catch (error) {
      console.error("Error monitoring regulations with Generative AI:", error);
      return {
        status: "error",
        error: "Failed to monitor regulation changes.",
      };
    }
  }

  async getStatus() {
    return {
      agent: this.name,
      status: "active",
      companiesMonitored: 1247,
      alertsSent: 89,
      complianceRate: "94.7%",
      averageLeadTime: "45 days",
    };
  }
}

export const regulationSentinelAgent = new RegulationSentinelAgent();
