import { db } from '../src/db';
import { users, paygTransactions, pricingConfig } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export class WhatsAppPaygService {
  private readonly PAYG_SERVICES = {
    'beneficial_ownership': { price: 99, name: 'Beneficial Ownership Filing' },
    'director_amendment': { price: 149, name: 'Director Amendment' },
    'annual_return': { price: 199, name: 'Annual Return Filing' },
    'bbee_certificate': { price: 199, name: 'B-BBEE Certificate Application' },
    'afs_submission': { price: 249, name: 'Annual Financial Statement Submission' },
    'company_update': { price: 299, name: 'Company Registration Update' }
  };

  async handlePaygRequest(phoneNumber: string, serviceType: keyof typeof this.PAYG_SERVICES, isUrgent = false) {
    const user = await this.getOrCreateUser(phoneNumber);
    const service = this.PAYG_SERVICES[serviceType];
    
    if (!service) throw new Error('Invalid service type');
    
    let finalPrice = service.price;
    if (isUrgent) finalPrice = Math.round(finalPrice * 1.5); // 50% urgency fee
    
    const transaction = await db.insert(paygTransactions).values({
      userId: user.id,
      serviceType,
      amount: finalPrice.toString(),
      urgencyFee: isUrgent,
      status: 'pending'
    }).returning();

    const paymentLink = await this.generatePaymentLink(transaction[0].id, finalPrice);
    
    return {
      message: `${service.name}: R${finalPrice}${isUrgent ? ' (Urgent)' : ''}\n\nPay securely: ${paymentLink}\n\nOnce paid, we\'ll process your filing within ${isUrgent ? '2 hours' : '24 hours'}.`,
      transactionId: transaction[0].id,
      paymentLink
    };
  }

  async generateComplianceScore(phoneNumber: string, companyRegNumber?: string) {
    const user = await this.getOrCreateUser(phoneNumber);
    
    if (companyRegNumber) {
      await db.update(users)
        .set({ companyRegNumber, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }

    // Mock compliance check - replace with actual CIPC API integration
    const issues = await this.checkComplianceIssues(companyRegNumber || user.companyRegNumber);
    const score = Math.max(0, 100 - (issues.length * 20));
    
    let message = `🏢 *CIPC Compliance Score: ${score}/100*\n\n`;
    
    if (issues.length === 0) {
      message += "✅ All compliance requirements are up to date!";
    } else {
      message += "⚠️ *Issues Found:*\n";
      issues.forEach((issue, index) => {
        message += `${index + 1}. ${issue.description}\n`;
        message += `   💰 Fix now: R${issue.price} - Reply "${issue.code}"\n\n`;
      });
    }
    
    return { message, score, issues };
  }

  private async checkComplianceIssues(companyRegNumber?: string) {
    if (!companyRegNumber) return [];
    
    const issues = [];
    const now = new Date();
    
    // Check Annual Return (due within 30 days of anniversary)
    const year = parseInt(companyRegNumber.substring(0, 4));
    const anniversaryDate = new Date(now.getFullYear(), 2, 15); // March 15th
    if (year < now.getFullYear() && now > anniversaryDate) {
      const daysPastDue = Math.floor((now.getTime() - anniversaryDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysPastDue > 30) {
        issues.push({ code: 'AR', description: `Annual Return overdue by ${daysPastDue - 30} days`, price: 299 }); // Urgent pricing
      }
    }
    
    // Check Beneficial Ownership (due March 31st annually)
    const boDeadline = new Date(now.getFullYear(), 2, 31); // March 31st
    const daysUntilBO = Math.floor((boDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilBO <= 60 && daysUntilBO > 0) {
      issues.push({ code: 'BO', description: `Beneficial Ownership due in ${daysUntilBO} days`, price: daysUntilBO <= 7 ? 149 : 99 });
    }
    
    return issues;
  }

  private async getOrCreateUser(phoneNumber: string) {
    const existingUser = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
    
    if (existingUser.length > 0) {
      return existingUser[0];
    }
    
    const newUser = await db.insert(users).values({
      phoneNumber,
      subscriptionTier: 'freemium'
    }).returning();
    
    return newUser[0];
  }

  private async generatePaymentLink(transactionId: string, amount: number): Promise<string> {
    // Integration with PayFast or similar payment provider
    const paymentData = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      amount: amount.toFixed(2),
      item_name: 'CIPC Filing Service',
      custom_str1: transactionId,
      return_url: `${process.env.BASE_URL}/payment/success`,
      cancel_url: `${process.env.BASE_URL}/payment/cancel`,
      notify_url: `${process.env.BASE_URL}/webhooks/payfast`
    };
    
    // Generate PayFast URL with signature
    const queryString = new URLSearchParams(paymentData).toString();
    return `https://sandbox.payfast.co.za/eng/process?${queryString}`;
  }

  async handleSubscriptionUpgrade(phoneNumber: string, targetTier: 'growth' | 'enterprise') {
    const user = await this.getOrCreateUser(phoneNumber);
    const pricing = { growth: 899, enterprise: 2999 };
    const price = pricing[targetTier];
    
    const benefits = {
      growth: "✅ Unlimited Annual Returns\n✅ BO Filings included\n✅ Predictive alerts\n✅ Priority support",
      enterprise: "✅ Everything in Growth\n✅ Dedicated manager\n✅ Blockchain audits\n✅ VIP onboarding\n✅ 24/7 support"
    };
    
    return {
      message: `🚀 *Upgrade to ${targetTier.toUpperCase()}* - R${price}/month\n\n${benefits[targetTier]}\n\nUpgrade now: ${await this.generateSubscriptionPaymentLink(user.id, targetTier, price)}`,
      tier: targetTier,
      price
    };
  }

  private async generateSubscriptionPaymentLink(userId: string, tier: string, amount: number): Promise<string> {
    // Similar to PAYG but for recurring subscriptions
    return `${process.env.BASE_URL}/subscribe/${tier}?user=${userId}&amount=${amount}`;
  }
}