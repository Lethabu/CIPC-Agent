import { db } from '../src/db/index.js';
import { leadScoutResults } from '../../shared/schema.js';
import OpenAI from 'openai';

interface LeadData {
  platform: 'twitter' | 'linkedin' | 'news';
  content: string;
  authorHandle?: string;
  url?: string;
  timestamp?: Date;
}

export class LeadScoutService {
  private openai: OpenAI;
  
  private readonly COMPLIANCE_KEYWORDS = [
    'CIPC', 'annual return', 'beneficial ownership', 'company registration',
    'compliance', 'SARS', 'tax clearance', 'director', 'shareholder',
    'business registration', 'company secretary', 'accounting firm'
  ];

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async scoutAccountingFirms(location = 'Gauteng', limit = 50): Promise<Array<{
    name: string;
    contact: string;
    platform: string;
    leadScore: number;
    reason: string;
  }>> {
    const firms = [];
    
    // Mock data for sprint - replace with actual LinkedIn/Google scraping
    const mockFirms = [
      { name: 'PKF Johannesburg', contact: 'info@pkf.co.za', website: 'pkf.co.za' },
      { name: 'Grant Thornton SA', contact: 'info@gt.co.za', website: 'grantthornton.co.za' },
      { name: 'BDO South Africa', contact: 'info@bdo.co.za', website: 'bdo.co.za' },
      { name: 'Mazars', contact: 'info@mazars.co.za', website: 'mazars.co.za' },
      { name: 'Moore Johannesburg', contact: 'info@moore-jhb.co.za', website: 'moore-jhb.co.za' }
    ];

    for (const firm of mockFirms) {
      const leadScore = await this.calculateLeadScore({
        platform: 'linkedin',
        content: `${firm.name} - Accounting and business advisory services`,
        authorHandle: firm.contact
      });

      if (leadScore > 60) {
        firms.push({
          name: firm.name,
          contact: firm.contact,
          platform: 'linkedin',
          leadScore,
          reason: 'Established accounting firm with CIPC services'
        });
      }
    }

    return firms.slice(0, limit);
  }

  async calculateLeadScore(lead: LeadData): Promise<number> {
    let score = 0;
    const content = lead.content.toLowerCase();

    // Keyword matching (40 points max)
    const keywordMatches = this.COMPLIANCE_KEYWORDS.filter(keyword => 
      content.includes(keyword.toLowerCase())
    ).length;
    score += Math.min(40, keywordMatches * 8);

    // Platform weighting (20 points max)
    const platformScores = { linkedin: 20, twitter: 15, news: 10 };
    score += platformScores[lead.platform] || 0;

    // AI sentiment and relevance analysis (40 points max)
    const aiScore = await this.analyzeWithAI(lead);
    score += aiScore;

    return Math.min(100, score);
  }

  private async analyzeWithAI(lead: LeadData): Promise<number> {
    try {
      const prompt = `
      Analyze this business content for CIPC compliance service potential:
      
      Platform: ${lead.platform}
      Content: "${lead.content}"
      
      Score 0-40 based on:
      - Pain points mentioned (compliance, deadlines, penalties)
      - Business size indicators (employees, revenue, clients)
      - Urgency signals (overdue, deadline, urgent)
      - Decision maker indicators (owner, director, CEO, CFO)
      
      Respond with just a number 0-40.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10,
        temperature: 0.1
      });

      const score = parseInt(response.choices[0]?.message?.content?.trim() || '0');
      return Math.max(0, Math.min(40, score));
    } catch (error) {
      console.error('AI analysis error:', error);
      return 20; // Default moderate score
    }
  }

  async storeLead(lead: LeadData, score: number, companyInfo?: any): Promise<void> {
    await db.insert(leadScoutResults).values({
      platform: lead.platform,
      content: lead.content,
      authorHandle: lead.authorHandle,
      leadScore: score,
      extractedCompanyInfo: companyInfo,
      conversionStatus: 'pending'
    });
  }

  async generateOutreachMessage(firmName: string, contactPerson?: string): Promise<{
    subject: string;
    message: string;
    followUp: string;
  }> {
    const prompt = `
    Generate a personalized outreach message for ${firmName} about our CIPC compliance partnership.
    
    Key points:
    - We automate CIPC compliance (90 seconds vs 2-4 hours)
    - 20% lifetime commission on referrals
    - Their clients get 10% discount
    - White-label option available
    - No work required from them
    
    Make it professional but conversational. Include specific value props.
    
    Format:
    SUBJECT: [email subject]
    MESSAGE: [main email body]
    FOLLOW_UP: [follow-up message for 3 days later]
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content || '';
    
    return {
      subject: this.extractSection(content, 'SUBJECT:'),
      message: this.extractSection(content, 'MESSAGE:'),
      followUp: this.extractSection(content, 'FOLLOW_UP:')
    };
  }

  private extractSection(content: string, section: string): string {
    const regex = new RegExp(`${section}\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }

  async trackOutreachResults(leadId: string, status: 'contacted' | 'responded' | 'converted' | 'rejected'): Promise<void> {
    await db.update(leadScoutResults)
      .set({ 
        conversionStatus: status,
        contactedAt: status === 'contacted' ? new Date() : undefined
      })
      .where(eq(leadScoutResults.id, leadId));
  }

  async getTopLeads(limit = 20): Promise<any[]> {
    return await db.select()
      .from(leadScoutResults)
      .where(eq(leadScoutResults.conversionStatus, 'pending'))
      .orderBy(leadScoutResults.leadScore)
      .limit(limit);
  }

  async generateWeeklyReport(): Promise<{
    totalLeads: number;
    averageScore: number;
    conversionRate: number;
    topSources: string[];
    recommendations: string[];
  }> {
    const leads = await db.select().from(leadScoutResults);
    
    const totalLeads = leads.length;
    const averageScore = leads.reduce((sum, lead) => sum + lead.leadScore, 0) / totalLeads;
    const converted = leads.filter(lead => lead.conversionStatus === 'converted').length;
    const conversionRate = (converted / totalLeads) * 100;
    
    const platformCounts = leads.reduce((acc, lead) => {
      acc[lead.platform] = (acc[lead.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topSources = Object.entries(platformCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([platform]) => platform);

    const recommendations = [
      averageScore < 60 ? 'Improve keyword targeting for higher quality leads' : null,
      conversionRate < 5 ? 'Optimize outreach messaging and follow-up sequence' : null,
      topSources[0] === 'linkedin' ? 'Focus more resources on LinkedIn prospecting' : null
    ].filter(Boolean);

    return {
      totalLeads,
      averageScore: Math.round(averageScore),
      conversionRate: Math.round(conversionRate * 10) / 10,
      topSources,
      recommendations
    };
  }
}

export default LeadScoutService;