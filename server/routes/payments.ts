import express from 'express';
import { db } from '../src/db/index.js';
import { paygTransactions, users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// PayFast webhook handler
router.post('/payfast/webhook', async (req, res) => {
  try {
    const {
      payment_status,
      custom_str1: transactionId,
      amount_gross,
      signature
    } = req.body;

    // Verify PayFast signature (implement proper verification)
    if (!verifyPayFastSignature(req.body, signature)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    if (payment_status === 'COMPLETE') {
      // Update transaction status
      const result = await db.update(paygTransactions)
        .set({ 
          status: 'paid', 
          completedAt: new Date(),
          paymentReference: `PF_${Date.now()}`
        })
        .where(eq(paygTransactions.id, transactionId))
        .returning();

      if (result.length > 0) {
        const transaction = result[0];
        
        // Update user total spent
        await db.update(users)
          .set({ 
            totalSpent: sql`total_spent + ${transaction.amount}`,
            updatedAt: new Date()
          })
          .where(eq(users.id, transaction.userId));

        // Trigger Temporal workflow for processing
        // await startFilingWorkflow(transactionId);

        console.log(`✅ Payment completed: ${transactionId}`);
        
        // Send confirmation WhatsApp message
        await sendPaymentConfirmation(transaction.userId, transaction.serviceType);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Subscription payment webhook
router.post('/subscription/webhook', async (req, res) => {
  try {
    const { user_id, tier, status } = req.body;

    if (status === 'active') {
      await db.update(users)
        .set({
          subscriptionTier: tier,
          subscriptionStatus: 'active',
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          updatedAt: new Date()
        })
        .where(eq(users.id, user_id));

      await sendSubscriptionConfirmation(user_id, tier);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Subscription webhook error:', error);
    res.status(500).json({ error: 'Subscription webhook failed' });
  }
});

function verifyPayFastSignature(data: any, signature: string): boolean {
  // Implement proper PayFast signature verification
  // This is a simplified version - use actual PayFast verification logic
  return true;
}

async function sendPaymentConfirmation(userId: string, serviceType: string) {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) return;

  const serviceNames = {
    'beneficial_ownership': 'Beneficial Ownership Filing',
    'annual_return': 'Annual Return Filing',
    'director_amendment': 'Director Amendment',
    'bbee_certificate': 'B-BBEE Certificate',
    'afs_submission': 'AFS Submission',
    'company_update': 'Company Update'
  };

  const message = `✅ *Payment Confirmed!*\n\nService: ${serviceNames[serviceType] || serviceType}\n\nYour filing is now being processed. You'll receive updates as we progress.\n\nExpected completion: ${getExpectedCompletion(serviceType)}`;

  // Send WhatsApp message (implement actual sending)
  console.log(`📤 Confirmation to ${user[0].phoneNumber}: ${message}`);
}

async function sendSubscriptionConfirmation(userId: string, tier: string) {
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) return;

  const message = `🚀 *Welcome to ${tier.toUpperCase()}!*\n\nYour subscription is now active. You have access to:\n\n${getSubscriptionBenefits(tier)}\n\nReply "HELP" to see all available commands.`;

  console.log(`📤 Subscription confirmation to ${user[0].phoneNumber}: ${message}`);
}

function getExpectedCompletion(serviceType: string): string {
  const times = {
    'beneficial_ownership': '24-48 hours',
    'annual_return': '2-3 business days',
    'director_amendment': '1-2 business days',
    'bbee_certificate': '5-7 business days',
    'afs_submission': '3-5 business days',
    'company_update': '1-2 business days'
  };
  return times[serviceType] || '2-3 business days';
}

function getSubscriptionBenefits(tier: string): string {
  const benefits = {
    'growth': '✅ Unlimited Annual Returns\n✅ BO Filings included\n✅ Predictive alerts\n✅ Priority support',
    'enterprise': '✅ Everything in Growth\n✅ Dedicated manager\n✅ Blockchain audits\n✅ 24/7 support'
  };
  return benefits[tier] || 'Premium features included';
}

export default router;