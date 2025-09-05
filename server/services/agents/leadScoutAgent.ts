import { db } from '../../db/index.js';
import { leadScoutResults } from '../../../shared/schema.js';
import OpenAI from 'openai';

export class LeadScoutAgent {
  private openai: OpenAI;
  private readonly SEARCH_KEYWORDS = [
    'CIPC filing', 'annual return', 'company registration', 'beneficial ownership',
    'SMME compliance', 'director amendment', 'company secretary', 'B-BBEE certificate'
  ];

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async scoutLeads() {
    console.log('🔍 Lead Scout Agent starting...');
    
    const platforms = ['twitter', 'linkedin'] as const;
    const results = [];
    
    for (const platform of platforms) {
      const platformResults = await this.scoutPlatform(platform);
      results.push(...platformResults);
    }
    
    // Process and score leads
    const scoredLeads = await this.scoreLeads(results);
    
    // Save high-quality leads (score > 70)
    const qualityLeads = scoredLeads.filter(lead => lead.score > 70);
    await this.saveLeads(qualityLeads);
    
    console.log(`✅ Found ${qualityLeads.length} quality leads`);
    return qualityLeads;
  }

  private async scoutPlatform(platform: 'twitter' | 'linkedin') {
    // Mock implementation - replace with actual API calls
    const mockResults = [
      {
        platform,
        content: "Struggling with CIPC annual returns again this year. Why is this process so complicated? #SMME #Compliance",
        authorHandle: "@business_owner_za",
        url: "https://twitter.com/business_owner_za/status/123",
        timestamp: new Date()
      },
      {
        platform,
        content: "Looking for help with beneficial ownership filings. Anyone know a good service? Deadline approaching fast!",
        authorHandle: "@startup_founder",
        url: "https://twitter.com/startup_founder/status/124",
        timestamp: new Date()
      }
    ];
    
    return mockResults;
  }

  private async scoreLeads(leads: any[]) {
    const scoredLeads = [];
    
    for (const lead of leads) {
      const score = await this.calculateLeadScore(lead.content);
      const extractedInfo = await this.extractCompanyInfo(lead.content);
      
      scoredLeads.push({
        ...lead,
        score,
        extractedInfo
      });
    }
    
    return scoredLeads;
  }

  private async calculateLeadScore(content: string): Promise<number> {
    const prompt = `
    Analyze this social media post and score it as a potential lead for a CIPC compliance service (0-100):
    
    Content: "${content}"
    
    Score based on:
    - Urgency indicators (deadlines, overdue, struggling) = +30 points
    - Specific CIPC services mentioned = +25 points  
    - Business owner language = +20 points
    - Pain points expressed = +15 points
    - South African context = +10 points
    
    Return only the numeric score (0-100).
    `;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1
      });
      
      const score = parseInt(response.choices[0].message.content?.trim() || '0');
      return Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error('Error scoring lead:', error);
      return 0;
    }
  }

  private async extractCompanyInfo(content: string) {
    const prompt = `
    Extract company information from this post:
    "${content}"
    
    Return JSON with: companyName, industry, urgency (high/medium/low), services_needed (array)
    `;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.1
      });
      
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Error extracting company info:', error);
      return {};
    }
  }

  private async saveLeads(leads: any[]) {
    for (const lead of leads) {
      await db.insert(leadScoutResults).values({
        platform: lead.platform,
        content: lead.content,
        authorHandle: lead.authorHandle,
        leadScore: lead.score,
        extractedCompanyInfo: lead.extractedInfo,
        conversionStatus: 'pending'
      });
    }
  }

  async generateOutreachMessage(leadId: string) {
    const lead = await db.select().from(leadScoutResults).where(eq(leadScoutResults.id, leadId)).limit(1);
    
    if (!lead.length) throw new Error('Lead not found');
    
    const leadData = lead[0];
    const info = leadData.extractedCompanyInfo as any;
    
    const prompt = `
    Create a personalized WhatsApp outreach message for this lead:
    
    Original post: "${leadData.content}"
    Company info: ${JSON.stringify(info)}
    
    Message should:
    - Reference their specific pain point
    - Offer immediate help
    - Include our free compliance score
    - Be under 160 characters
    - Sound helpful, not salesy
    `;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.7
    });
    
    return response.choices[0].message.content?.trim() || '';
  }

  async getTopLeads(limit = 10) {
    return await db.select()
      .from(leadScoutResults)
      .where(eq(leadScoutResults.conversionStatus, 'pending'))
      .orderBy(desc(leadScoutResults.leadScore))
      .limit(limit);
  }
}