import { db } from '../src/db/index.js';
import { users, paygTransactions } from '../../shared/schema.js';
import { eq, and, gte, count, sum } from 'drizzle-orm';
import SubscriptionService from './subscriptionService.js';

export class UpgradeDetectionService {
  private subscriptionService: SubscriptionService;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  async checkForUpgradeOpportunities(): Promise<void> {
    console.log('🔍 Checking for upgrade opportunities...');
    
    // Get all freemium users
    const freemiumUsers = await db.select()
      .from(users)
      .where(eq(users.subscriptionTier, 'freemium'));

    for (const user of freemiumUsers) {
      await this.evaluateUserForUpgrade(user);
    }
  }

  private async evaluateUserForUpgrade(user: any): Promise<void> {
    // Check if user has made 3+ PAYG transactions
    const transactionCount = await db.select({ count: count() })
      .from(paygTransactions)
      .where(and(
        eq(paygTransactions.userId, user.id),
        eq(paygTransactions.status, 'paid')
      ));

    if (transactionCount[0]?.count >= 3) {
      await this.sendUpgradeMessage(user, 'frequent_usage');
      return;
    }

    // Check spending threshold
    const totalSpent = parseFloat(user.totalSpent || '0');
    if (totalSpent >= 600) { // 70% of Growth plan price
      await this.sendUpgradeMessage(user, 'cost_savings');
      return;
    }

    // Check recent activity pattern
    const recentActivity = await this.checkRecentActivity(user.id);
    if (recentActivity.shouldUpgrade) {
      await this.sendUpgradeMessage(user, 'activity_pattern');
    }
  }

  private async checkRecentActivity(userId: string): Promise<{
    shouldUpgrade: boolean;
    reason: string;
  }> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const recentTransactions = await db.select({
      count: count(),
      totalAmount: sum(paygTransactions.amount)
    })
    .from(paygTransactions)
    .where(and(
      eq(paygTransactions.userId, userId),
      eq(paygTransactions.status, 'paid'),
      gte(paygTransactions.createdAt, sevenDaysAgo)
    ));

    const weeklySpend = parseFloat(recentTransactions[0]?.totalAmount || '0');
    const weeklyCount = recentTransactions[0]?.count || 0;

    // If spending R150+ per week, suggest upgrade
    if (weeklySpend >= 150) {
      return {
        shouldUpgrade: true,
        reason: 'High weekly spending detected'
      };
    }

    // If 2+ transactions per week, suggest upgrade
    if (weeklyCount >= 2) {
      return {
        shouldUpgrade: true,
        reason: 'Frequent weekly usage'
      };
    }

    return { shouldUpgrade: false, reason: 'Low activity' };
  }

  private async sendUpgradeMessage(user: any, trigger: string): Promise<void> {
    const magicLink = await this.subscriptionService.generateMagicLink(user.id);
    
    let message = '';
    
    switch (trigger) {
      case 'frequent_usage':
        const totalSpent = parseFloat(user.totalSpent || '0');
        message = `Hi ${user.fullName || 'there'}! 👋

You've now used CIPC Agent 3 times and spent R${totalSpent.toFixed(0)} on individual filings.

💡 *Switch to our Growth Plan and save money!*

✅ Unlimited filings for just R899/month
✅ You'd already be saving R${Math.max(0, totalSpent - 899).toFixed(0)} this month
✅ Predictive compliance alerts
✅ Priority support

Upgrade in 30 seconds: ${magicLink}

Questions? Just reply to this message.`;
        break;

      case 'cost_savings':
        message = `Hi ${user.fullName || 'there'}! 💰

Great news! Based on your usage, you can save money with our Growth Plan.

Your current spending: R${parseFloat(user.totalSpent || '0').toFixed(0)}
Growth Plan: R899/month (unlimited filings)

*You'd save R${Math.max(0, parseFloat(user.totalSpent || '0') - 899).toFixed(0)} per month!*

Plus get:
✅ Predictive compliance alerts
✅ Priority support
✅ No per-filing charges

Switch now: ${magicLink}`;
        break;

      case 'activity_pattern':
        message = `Hi ${user.fullName || 'there'}! 📈

I noticed you're using CIPC Agent regularly. That's awesome!

Since you're an active user, you might benefit from our Growth Plan:

✅ Unlimited filings (no more per-transaction fees)
✅ Predictive alerts (never miss a deadline)
✅ Priority support

See if it makes sense for you: ${magicLink}

No pressure - just want to make sure you're getting the best value! 😊`;
        break;
    }

    // Send WhatsApp message (implement actual sending)
    console.log(`📤 Upgrade message to ${user.phoneNumber}:`);
    console.log(message);
    
    // Log the upgrade opportunity
    await this.logUpgradeOpportunity(user.id, trigger);
  }

  private async logUpgradeOpportunity(userId: string, trigger: string): Promise<void> {
    // This would typically go to an analytics/tracking table
    console.log(`📊 Upgrade opportunity logged: User ${userId}, Trigger: ${trigger}`);
  }

  async processUpgradeFromTransaction(transactionId: string): Promise<void> {
    const [transaction] = await db.select()
      .from(paygTransactions)
      .where(eq(paygTransactions.id, transactionId))
      .limit(1);

    if (!transaction) return;

    // Check if this is the user's 3rd transaction
    const userTransactionCount = await db.select({ count: count() })
      .from(paygTransactions)
      .where(and(
        eq(paygTransactions.userId, transaction.userId),
        eq(paygTransactions.status, 'paid')
      ));

    if (userTransactionCount[0]?.count === 3) {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, transaction.userId))
        .limit(1);

      if (user && user.subscriptionTier === 'freemium') {
        // Wait 5 minutes then send upgrade message
        setTimeout(async () => {
          await this.sendUpgradeMessage(user, 'frequent_usage');
        }, 5 * 60 * 1000);
      }
    }
  }
}

export default UpgradeDetectionService;