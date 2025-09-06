import axios from 'axios';

export class WhatsAppIntegration {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.AISENSY_API_KEY || '';
    this.baseUrl = process.env.AISENSY_API_URL || 'https://api.aisensy.com';
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      await axios.post(`${this.baseUrl}/send-message`, {
        phone: to,
        message: message,
        type: 'text'
      }, {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      });
      return true;
    } catch (error) {
      console.error('WhatsApp send failed:', error);
      return false;
    }
  }

  async processInbound(data: any): Promise<string> {
    const message = data.message?.toLowerCase() || '';
    
    if (message.includes('score')) {
      return this.getComplianceScore(data.from);
    }
    
    if (['ar', 'bo', 'da'].includes(message)) {
      return this.getServiceQuote(message.toUpperCase());
    }
    
    return `🏢 *CIPC Agent*\n\nReply:\n• "SCORE" - Free compliance check\n• "AR" - Annual Return (R199)\n• "BO" - Beneficial Ownership (R99)\n• "DA" - Director Amendment (R149)`;
  }

  private getComplianceScore(phone: string): string {
    const score = Math.floor(Math.random() * 40) + 60; // Mock score
    return `📊 *Compliance Score: ${score}/100*\n\n⚠️ Issues found:\n• Annual Return overdue\n• BO filing due in 14 days\n\nFix now: Reply "AR" or "BO"`;
  }

  private getServiceQuote(service: string): string {
    const prices = { AR: 199, BO: 99, DA: 149 };
    const price = prices[service];
    return `💼 *${service} Filing: R${price}*\n\n✅ Complete filing + confirmation\n⏱️ 24-48 hour processing\n\nPay: https://pay.cipcagent.co.za/${service.toLowerCase()}`;
  }
}