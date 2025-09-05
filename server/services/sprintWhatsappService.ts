import { db } from '../src/db/index.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

export class SprintWhatsAppService {
  private readonly SERVICES = {
    'AR': { name: 'Annual Return', price: 199, urgent: 299, code: 'annual_return' },
    'BO': { name: 'Beneficial Ownership', price: 99, urgent: 149, code: 'beneficial_ownership' },
    'DA': { name: 'Director Amendment', price: 149, urgent: 224, code: 'director_amendment' }
  };

  async handleMessage(phoneNumber: string, message: string) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const userMessage = message.toLowerCase().trim();
    
    // Track user interaction
    await this.trackUser(cleanPhone);
    
    if (userMessage.includes('hi') || userMessage.includes('hello') || userMessage.includes('start')) {
      return this.getWelcomeMessage();
    }
    
    if (userMessage.includes('score') || userMessage.includes('check')) {
      return this.getComplianceScore(cleanPhone);
    }
    
    if (['ar', 'bo', 'da'].includes(userMessage)) {
      return this.getServiceQuote(userMessage.toUpperCase(), cleanPhone);
    }
    
    if (userMessage.match(/\d{10,}/)) {
      return this.registerCompany(cleanPhone, userMessage.match(/\d{10,}/)[0]);
    }
    
    return this.getHelpMessage();
  }

  private async trackUser(phoneNumber: string) {
    const existing = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
    
    if (existing.length === 0) {
      await db.insert(users).values({
        phoneNumber,
        subscriptionTier: 'freemium',
        createdAt: new Date()
      });
    }
  }

  private getWelcomeMessage() {
    return `🏢 *Welcome to CIPC Agent!*

I'm your AI compliance assistant. Get started:

📊 *FREE Compliance Score*
Reply "SCORE" + your company reg number
Example: "SCORE 2020123456789"

⚡ *Instant PAYG Services:*
• Annual Return (R199) - Reply "AR"
• Beneficial Ownership (R99) - Reply "BO"  
• Director Amendment (R149) - Reply "DA"

🚨 *Urgent filings* (50% extra) processed in 2 hours!

What can I help you with?`;
  }

  private async getComplianceScore(phoneNumber: string) {
    // Mock compliance check for sprint
    const issues = Math.random() > 0.5 ? [
      { type: 'Annual Return', overdue: true, penalty: 'R2,500' },
      { type: 'Beneficial Ownership', due: '14 days', penalty: 'R50,000' }
    ] : [];
    
    const score = issues.length === 0 ? 100 : Math.max(20, 100 - (issues.length * 40));
    
    let message = `📊 *CIPC Compliance Score: ${score}/100*\n\n`;
    
    if (issues.length === 0) {
      message += "✅ *Excellent!* All compliance requirements are up to date.\n\n";
      message += "💡 Stay protected with our Growth plan (R899/mo) for unlimited filings and proactive alerts.";
    } else {
      message += "⚠️ *Issues Found:*\n\n";
      issues.forEach((issue, i) => {
        message += `${i + 1}. *${issue.type}*\n`;
        if (issue.overdue) {
          message += `   🚨 OVERDUE - Penalty: ${issue.penalty}\n`;
        } else {
          message += `   ⏰ Due in ${issue.due} - Penalty: ${issue.penalty}\n`;
        }
        message += `   💰 Fix now: Reply "${this.getServiceCode(issue.type)}"\n\n`;
      });
    }
    
    return message;
  }

  private getServiceCode(issueType: string): string {
    const codes = {
      'Annual Return': 'AR',
      'Beneficial Ownership': 'BO',
      'Director Amendment': 'DA'
    };
    return codes[issueType] || 'HELP';
  }

  private async getServiceQuote(serviceCode: string, phoneNumber: string) {
    const service = this.SERVICES[serviceCode];
    if (!service) return this.getHelpMessage();
    
    // Check if urgent (mock logic for sprint)
    const isUrgent = Math.random() > 0.7; // 30% chance of urgent
    const price = isUrgent ? service.urgent : service.price;
    const urgentText = isUrgent ? ' (URGENT - 2hr processing)' : '';
    
    // Generate payment link (mock for sprint)
    const paymentLink = `https://your-domain.com/pay/${serviceCode}-${Date.now()}`;
    
    return `💼 *${service.name}${urgentText}*

💰 *Price: R${price}*
⏱️ *Processing: ${isUrgent ? '2 hours' : '24 hours'}*
✅ *Includes: Complete filing + confirmation*

🔗 *Pay securely:*
${paymentLink}

Once paid, we'll process your filing immediately. You'll get updates via WhatsApp.

Need help? Reply "SUPPORT"`;
  }

  private async registerCompany(phoneNumber: string, regNumber: string) {
    await db.update(users)
      .set({ companyRegNumber: regNumber, updatedAt: new Date() })
      .where(eq(users.phoneNumber, phoneNumber));
    
    return `✅ *Company ${regNumber} registered!*

🎯 *Compliance monitoring is now active.*

Your personalized compliance score:
Reply "SCORE" to see current status

Available services:
• Reply "AR" for Annual Return
• Reply "BO" for Beneficial Ownership
• Reply "DA" for Director Amendment

I'll send you proactive alerts before any deadlines! 🔔`;
  }

  private getHelpMessage() {
    return `🤖 *How can I help?*

📊 *Get compliance score:*
"SCORE" + company number

⚡ *Quick services:*
• "AR" - Annual Return (R199)
• "BO" - Beneficial Ownership (R99)
• "DA" - Director Amendment (R149)

🆘 *Need human help?*
Reply "SUPPORT" to speak with our team

What would you like to do?`;
  }

  // Manual processing helpers for sprint
  async logManualFiling(phoneNumber: string, serviceType: string, amount: number) {
    console.log(`📋 MANUAL FILING REQUIRED:`);
    console.log(`Phone: ${phoneNumber}`);
    console.log(`Service: ${serviceType}`);
    console.log(`Amount: R${amount}`);
    console.log(`Time: ${new Date().toISOString()}`);
    
    // In sprint, this logs to console for manual processing
    // Later, this becomes a Temporal workflow
  }

  async sendPaymentConfirmation(phoneNumber: string, serviceType: string, reference: string) {
    return `✅ *Payment Confirmed!*

Service: ${serviceType}
Reference: ${reference}

🔄 *Your filing is being processed...*

You'll receive updates as we progress:
1. ✅ Payment confirmed
2. 🔄 Documents being prepared  
3. 📤 Submitted to CIPC
4. ✅ Filing complete

Expected completion: ${this.getExpectedTime(serviceType)}

Questions? Reply "STATUS" anytime.`;
  }

  private getExpectedTime(serviceType: string): string {
    const times = {
      'Annual Return': '2-3 business days',
      'Beneficial Ownership': '24-48 hours',
      'Director Amendment': '1-2 business days'
    };
    return times[serviceType] || '2-3 business days';
  }
}