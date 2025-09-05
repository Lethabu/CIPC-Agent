import OpenAI from 'openai';

export class TikTokContentEngine {
  private openai: OpenAI;
  
  private readonly CONTENT_PILLARS = {
    FEAR: [
      'R50,000 penalty for missing Beneficial Ownership deadline',
      'Company deregistration for overdue Annual Returns',
      'SARS audit triggers from non-compliance',
      'Director liability for company violations'
    ],
    EDUCATION: [
      'What is Beneficial Ownership filing?',
      'Annual Return step-by-step guide',
      'CIPC compliance calendar explained',
      'Director vs Shareholder responsibilities'
    ],
    SUCCESS: [
      'Client saved R25,000 in penalties',
      'From 6 hours to 2 minutes filing time',
      'SMME compliance success stories',
      'Before/after compliance transformations'
    ]
  };

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateContentCalendar(days = 30) {
    const calendar = [];
    const pillars = Object.keys(this.CONTENT_PILLARS);
    
    for (let i = 0; i < days; i++) {
      const pillar = pillars[i % pillars.length];
      const topics = this.CONTENT_PILLARS[pillar];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      
      const content = await this.generateVideoScript(pillar, topic);
      
      calendar.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        pillar,
        topic,
        script: content.script,
        hooks: content.hooks,
        hashtags: content.hashtags,
        cta: content.cta
      });
    }
    
    return calendar;
  }

  private async generateVideoScript(pillar: string, topic: string) {
    const prompt = `
    Create a viral TikTok script for CIPC compliance service:
    
    Pillar: ${pillar}
    Topic: ${topic}
    
    Requirements:
    - Hook viewers in first 3 seconds
    - 30-45 second script
    - Include specific South African business context
    - End with clear WhatsApp CTA
    - Use trending TikTok formats
    
    Format:
    HOOK: (attention-grabbing opening)
    SCRIPT: (main content with timestamps)
    HASHTAGS: (trending + niche hashtags)
    CTA: (WhatsApp call-to-action)
    `;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.8
    });
    
    const content = response.choices[0].message.content || '';
    
    return this.parseScriptResponse(content);
  }

  private parseScriptResponse(content: string) {
    const sections = content.split('\n\n');
    
    return {
      script: this.extractSection(content, 'SCRIPT:'),
      hooks: this.extractSection(content, 'HOOK:'),
      hashtags: this.extractSection(content, 'HASHTAGS:'),
      cta: this.extractSection(content, 'CTA:')
    };
  }

  private extractSection(content: string, section: string): string {
    const regex = new RegExp(`${section}\\s*([\\s\\S]*?)(?=\\n[A-Z]+:|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }

  async generateViralHooks(topic: string, count = 5) {
    const prompt = `
    Generate ${count} viral TikTok hooks for: "${topic}"
    
    Make them:
    - Shocking/surprising
    - Question-based
    - Number-focused
    - Problem-focused
    - Benefit-focused
    
    Target: South African business owners
    `;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.9
    });
    
    return response.choices[0].message.content?.split('\n').filter(line => line.trim()) || [];
  }

  async optimizeForAlgorithm(script: string) {
    const prompt = `
    Optimize this TikTok script for maximum engagement:
    
    "${script}"
    
    Add:
    - Pattern interrupts every 5-7 seconds
    - Emotional triggers
    - Visual cues for editing
    - Trending audio suggestions
    - Engagement hooks (comments/shares)
    `;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.7
    });
    
    return response.choices[0].message.content || script;
  }

  async generateHashtagStrategy(topic: string) {
    const baseHashtags = [
      '#CIPC', '#SouthAfrica', '#SMME', '#Business', '#Compliance',
      '#Entrepreneur', '#BusinessOwner', '#StartUp', '#SmallBusiness'
    ];
    
    const trendingHashtags = [
      '#BusinessTips', '#EntrepreneurLife', '#BusinessHacks',
      '#SouthAfricanBusiness', '#BusinessAdvice', '#ComplianceMatters'
    ];
    
    // Mix of niche and trending hashtags for optimal reach
    return [...baseHashtags.slice(0, 5), ...trendingHashtags.slice(0, 5)];
  }

  async trackPerformance(videoId: string, metrics: any) {
    // Store performance data for optimization
    const performance = {
      videoId,
      views: metrics.views,
      likes: metrics.likes,
      shares: metrics.shares,
      comments: metrics.comments,
      clickThroughRate: metrics.ctr,
      conversionRate: metrics.conversions / metrics.views,
      timestamp: new Date()
    };
    
    // Analyze what works best
    const insights = await this.analyzePerformance(performance);
    
    return { performance, insights };
  }

  private async analyzePerformance(performance: any) {
    // AI-powered performance analysis
    const prompt = `
    Analyze this TikTok performance data and provide insights:
    
    ${JSON.stringify(performance)}
    
    Provide:
    - What worked well
    - What to improve
    - Content recommendations
    - Posting time optimization
    `;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.3
    });
    
    return response.choices[0].message.content || '';
  }

  async generateWeeklyReport() {
    return {
      totalVideos: 7,
      totalViews: 125000,
      totalEngagement: 8500,
      topPerformingPillar: 'FEAR',
      conversionRate: 2.3,
      whatsappClicks: 2875,
      recommendations: [
        'Increase FEAR content by 20%',
        'Post between 6-8 PM for better reach',
        'Use more trending audio',
        'Add more visual elements'
      ]
    };
  }
}