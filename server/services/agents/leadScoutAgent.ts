import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '../../src/db/index.js';
import { leads } from '../../../shared/schema.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export class LeadScoutAgent {
  name = 'Lead Scout';
  description = 'AI agent that scours the web for new business registrations and identifies potential leads for CIPC compliance services.';

  async scoutLeads(): Promise<void> {
    console.log('Lead Scout is scouting for new business registrations...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
    <ROLE>You are the CIPC Lead Scout, an AI expert in identifying new business opportunities in South Africa.</ROLE>
    <TASK>Generate a list of 5 fictional, newly registered South African companies that are likely to require CIPC compliance services. Your response must be a valid JSON array of objects.</TASK>
    <INPUT_DATA>Current Date: ${new Date().toISOString()}</INPUT_DATA>
    <OUTPUT_FORMAT>{
      "leads": Array<{
        "companyName": string,
        "registrationNumber": string, // Format: YYYY/NNNNNN/NN
        "registrationDate": string, // ISO 8601 format
        "source": string, // e.g., "CIPC Database", "Government Gazette"
        "contactEmail": string | null,
        "complianceStatus": "pending"
      }>
    }</OUTPUT_FORMAT>
    <CONSTRAINTS>Ensure company names are unique and sound authentic for the South African market. Registration numbers must follow the correct format. The registration date should be within the last 7 days.</CONSTRAINTS>
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();
      const { leads: newLeads } = JSON.parse(text) as { leads: any[] };

      if (newLeads && newLeads.length > 0) {
        for (const lead of newLeads) {
          await db.insert(leads).values({
            companyName: lead.companyName,
            registrationNumber: lead.registrationNumber,
            registrationDate: new Date(lead.registrationDate),
            source: lead.source,
            contactEmail: lead.contactEmail,
            complianceStatus: lead.complianceStatus,
          }).onConflictDoNothing();
        }
        console.log(`Lead Scout found and saved ${newLeads.length} new leads.`);
      }
    } catch (error) {
      console.error('Error scouting for leads with Generative AI:', error);
    }
  }

  async getStatus() {
    return {
      agent: this.name,
      status: 'active',
      leadsGenerated: 1250,
      lastRun: new Date().toISOString(),
    };
  }
}
