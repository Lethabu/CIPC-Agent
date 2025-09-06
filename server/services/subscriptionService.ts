import { db } from '../src/db/index.js';
import { users, subscriptions, paygTransactions } from '../../shared/schema.js';
import { eq, and, gte, count } from 'drizzle-orm';
import PaymentService from './paymentService.js';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    monthlyFilings: number;
    prioritySupport: boolean;
    dedicatedManager: boolean;
  };
}

export class SubscriptionService {
  private paymentService: PaymentService;
  
  private tiers: SubscriptionTier[] = [
    {
      id: 'growth',
      name: 'Growth',
      price: 89900, // R899 in cents
      features: [
        'Unlimited Annual Returns',
        'BO Filings included',
        'Predictive alerts',
        'Priority support'
      ],
      limits: {
        monthlyFilings: -1, // unlimited
        prioritySupport: true,
        dedicatedManager: false
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299900, // R2999 in cents
      features: [
        'Everything in Growth',
        'Dedicated manager',
        'Blockchain audits',
        '24/7 support',
        'White-label option'
      ],
      limits: {
        monthlyFilings: -1,
        prioritySupport: true,
        dedicatedManager: true
      }
    }
  ];

  constructor() {
    this.paymentService = new PaymentService();
  }

  async checkUpgradeEligibility(userId: string): Promise<{
    eligible: boolean;
    reason: string;
    recommendation?: string;
    savings?: number;
  }> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { eligible: false, reason: 'User not found' };
    }

    // Check PAYG usage in last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const paygUsage = await db.select({
      count: count(),
      totalSpent: paygTransactions.amount
    })
    .from(paygTransactions)
    .where(and(
      eq(paygTransactions.userId, userId),
      eq(paygTransactions.status, 'paid'),
      gte(paygTransactions.createdAt, thirtyDaysAgo)
    ));

    const monthlySpend = parseFloat(user.totalSpent) / 3; // Average over 3 months
    const growthPrice = 899;

    if (monthlySpend > growthPrice * 0.7) {
      const savings = monthlySpend - growthPrice;
      return {
        eligible: true,
        reason: 'Cost savings available',
        recommendation: 'growth',
        savings: Math.round(savings)
      };
    }

    if (paygUsage[0]?.count >= 3) {
      return {
        eligible: true,
        reason: 'Frequent usage detected',
        recommendation: 'growth'
      };
    }

    return {
      eligible: false,
      reason: 'Usage too low for subscription benefit'
    };
  }

  async createSubscription(userId: string, tierId: string): Promise<{
    success: boolean;
    paymentUrl?: string;
    error?: string;
  }> {
    const tier = this.tiers.find(t => t.id === tierId);
    if (!tier) {
      return { success: false, error: 'Invalid subscription tier' };
    }

    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    try {
      const paymentResponse = await this.paymentService.createPayment({
        amount: tier.price,
        currency: 'ZAR',
        email: user.email || `${user.phoneNumber}@cipcagent.co.za`,
        phone: user.phoneNumber,
        reference: `SUB_${userId}_${tierId}_${Date.now()}`,
        description: `${tier.name} Subscription - Monthly`,
        callbackUrl: `${process.env.BASE_URL}/api/subscriptions/callback`,
        provider: 'payfast',
        metadata: {
          userId,
          tierId,
          type: 'subscription'
        }
      });

      if (paymentResponse.success) {
        // Create pending subscription record
        await db.insert(subscriptions).values({
          userId,
          tierId,
          status: 'pending',
          paymentReference: paymentResponse.reference
        });

        return {
          success: true,
          paymentUrl: paymentResponse.checkoutUrl
        };
      }

      return {
        success: false,
        error: paymentResponse.error
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create subscription'
      };
    }
  }

  async processSubscriptionPayment(paymentReference: string): Promise<void> {
    const [subscription] = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.paymentReference, paymentReference))
      .limit(1);

    if (!subscription) return;

    const tier = this.tiers.find(t => t.id === subscription.tierId);
    if (!tier) return;

    // Activate subscription
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    await db.update(subscriptions)
      .set({
        status: 'active',
        startDate: new Date(),
        endDate,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, subscription.id));

    // Update user subscription status
    await db.update(users)
      .set({
        subscriptionTier: tier.id,
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: endDate,
        updatedAt: new Date()
      })
      .where(eq(users.id, subscription.userId));

    // Send confirmation
    await this.sendSubscriptionConfirmation(subscription.userId, tier);
  }

  async generateMagicLink(userId: string): Promise<string> {
    const token = Buffer.from(JSON.stringify({
      userId,
      expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    })).toString('base64');

    return `${process.env.BASE_URL}/manage-plan?token=${token}`;
  }

  async getSubscriptionStatus(userId: string): Promise<{
    tier: string;
    status: string;
    nextBilling?: Date;
    usage: {
      monthlyFilings: number;
      remainingFilings: number;
    };
  }> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Get current month usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyUsage = await db.select({ count: count() })
      .from(paygTransactions)
      .where(and(
        eq(paygTransactions.userId, userId),
        eq(paygTransactions.status, 'paid'),
        gte(paygTransactions.createdAt, startOfMonth)
      ));

    const tier = this.tiers.find(t => t.id === user.subscriptionTier);
    const remainingFilings = tier?.limits.monthlyFilings === -1 
      ? -1 
      : Math.max(0, (tier?.limits.monthlyFilings || 0) - (monthlyUsage[0]?.count || 0));

    return {
      tier: user.subscriptionTier || 'freemium',
      status: user.subscriptionStatus || 'inactive',
      nextBilling: user.subscriptionEndDate,
      usage: {
        monthlyFilings: monthlyUsage[0]?.count || 0,
        remainingFilings
      }
    };
  }

  private async sendSubscriptionConfirmation(userId: string, tier: SubscriptionTier): Promise<void> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return;

    const message = `🚀 *Welcome to ${tier.name.toUpperCase()}!*

Your subscription is now active. You now have access to:

${tier.features.map(f => `✅ ${f}`).join('\n')}

Your next billing date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}

Reply "HELP" to see all available commands.`;

    // Send WhatsApp message (implement actual sending)
    console.log(`📤 Subscription confirmation to ${user.phoneNumber}: ${message}`);
  }

  getTiers(): SubscriptionTier[] {
    return this.tiers;
  }
}

export default SubscriptionService;