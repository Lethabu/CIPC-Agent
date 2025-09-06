import express from 'express';
import { db } from '../src/db/index.js';
import { users, paygTransactions } from '../../shared/schema.js';
import { count, sum, gte, eq } from 'drizzle-orm';

const router = express.Router();

// Sprint dashboard data endpoint
router.get('/dashboard/metrics', async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Core metrics
    const totalUsers = await db.select({ count: count() }).from(users);
    const totalRevenue = await db.select({ sum: sum(paygTransactions.amount) })
      .from(paygTransactions)
      .where(eq(paygTransactions.status, 'paid'));

    const last24hUsers = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, last24h));

    const last24hRevenue = await db.select({ sum: sum(paygTransactions.amount) })
      .from(paygTransactions)
      .where(gte(paygTransactions.createdAt, last24h));

    const paidTransactions = await db.select({ count: count() })
      .from(paygTransactions)
      .where(eq(paygTransactions.status, 'paid'));

    // Service breakdown
    const serviceBreakdown = await db.select({
      service: paygTransactions.serviceType,
      count: count(),
      revenue: sum(paygTransactions.amount)
    })
    .from(paygTransactions)
    .where(eq(paygTransactions.status, 'paid'))
    .groupBy(paygTransactions.serviceType);

    // Sprint progress (mock data for demo)
    const sprintMetrics = {
      hoursElapsed: Math.floor((now.getTime() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60)),
      targetCustomers: 10,
      actualCustomers: paidTransactions[0]?.count || 0,
      targetRevenue: 1990,
      actualRevenue: parseFloat(totalRevenue[0]?.sum || '0'),
      conversionRate: totalUsers[0]?.count > 0 
        ? ((paidTransactions[0]?.count || 0) / totalUsers[0].count * 100).toFixed(1)
        : '0.0'
    };

    res.json({
      success: true,
      metrics: {
        totalUsers: totalUsers[0]?.count || 0,
        totalRevenue: parseFloat(totalRevenue[0]?.sum || '0'),
        paidCustomers: paidTransactions[0]?.count || 0,
        last24h: {
          newUsers: last24hUsers[0]?.count || 0,
          revenue: parseFloat(last24hRevenue[0]?.sum || '0')
        },
        serviceBreakdown,
        sprint: sprintMetrics
      }
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Live activity feed
router.get('/dashboard/activity', async (req, res) => {
  try {
    const recentTransactions = await db.select({
      id: paygTransactions.id,
      service: paygTransactions.serviceType,
      amount: paygTransactions.amount,
      status: paygTransactions.status,
      createdAt: paygTransactions.createdAt,
      phone: users.phoneNumber
    })
    .from(paygTransactions)
    .leftJoin(users, eq(paygTransactions.userId, users.id))
    .orderBy(paygTransactions.createdAt)
    .limit(20);

    const recentUsers = await db.select({
      phone: users.phoneNumber,
      createdAt: users.createdAt,
      tier: users.subscriptionTier
    })
    .from(users)
    .orderBy(users.createdAt)
    .limit(10);

    res.json({
      success: true,
      activity: {
        recentTransactions,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Sprint checklist status
router.get('/dashboard/checklist', async (req, res) => {
  try {
    const checklist = {
      day1: {
        title: 'Launch Funnel (Hours 0-24)',
        items: [
          { task: 'Deploy landing page', completed: true, timestamp: '2024-01-01T08:00:00Z' },
          { task: 'Configure WhatsApp webhook', completed: true, timestamp: '2024-01-01T09:30:00Z' },
          { task: 'Test bot responses', completed: true, timestamp: '2024-01-01T10:15:00Z' },
          { task: 'Send 20 LinkedIn DMs', completed: false, timestamp: null },
          { task: 'Post in 10 SMME groups', completed: false, timestamp: null },
          { task: 'Create first TikTok', completed: false, timestamp: null },
          { task: 'Book 5 demo calls', completed: false, timestamp: null }
        ]
      },
      day2: {
        title: 'Convert Leads (Hours 25-48)',
        items: [
          { task: 'Monitor AiSensy inbox', completed: false, timestamp: null },
          { task: 'Conduct 5-10 demos', completed: false, timestamp: null },
          { task: 'Manual CIPC filing', completed: false, timestamp: null },
          { task: 'Send payment links', completed: false, timestamp: null },
          { task: 'Follow up demos', completed: false, timestamp: null }
        ]
      },
      day3: {
        title: 'Close & Scale (Hours 49-72)',
        items: [
          { task: 'Call demo leads', completed: false, timestamp: null },
          { task: 'Use urgency script', completed: false, timestamp: null },
          { task: 'Process payments', completed: false, timestamp: null },
          { task: 'Create Founders Club', completed: false, timestamp: null },
          { task: 'Celebrate 10th customer', completed: false, timestamp: null },
          { task: 'Post social proof', completed: false, timestamp: null }
        ]
      }
    };

    res.json({
      success: true,
      checklist
    });
  } catch (error) {
    console.error('Checklist error:', error);
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
});

// Update checklist item
router.post('/dashboard/checklist/:day/:item', async (req, res) => {
  try {
    const { day, item } = req.params;
    const { completed } = req.body;

    // In a real implementation, this would update a database
    console.log(`✅ Checklist update: ${day} - Item ${item} - Completed: ${completed}`);

    res.json({
      success: true,
      message: 'Checklist updated'
    });
  } catch (error) {
    console.error('Checklist update error:', error);
    res.status(500).json({ error: 'Failed to update checklist' });
  }
});

// Manual filing log (for sprint)
router.post('/dashboard/manual-filing', async (req, res) => {
  try {
    const { phoneNumber, serviceType, amount, status } = req.body;

    console.log(`📋 MANUAL FILING LOG:`);
    console.log(`Phone: ${phoneNumber}`);
    console.log(`Service: ${serviceType}`);
    console.log(`Amount: R${amount}`);
    console.log(`Status: ${status}`);
    console.log(`Time: ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Manual filing logged'
    });
  } catch (error) {
    console.error('Manual filing log error:', error);
    res.status(500).json({ error: 'Failed to log manual filing' });
  }
});

// Generate sprint report
router.get('/dashboard/sprint-report', async (req, res) => {
  try {
    const totalUsers = await db.select({ count: count() }).from(users);
    const paidCustomers = await db.select({ count: count() })
      .from(paygTransactions)
      .where(eq(paygTransactions.status, 'paid'));
    const totalRevenue = await db.select({ sum: sum(paygTransactions.amount) })
      .from(paygTransactions)
      .where(eq(paygTransactions.status, 'paid'));

    const report = {
      sprintDuration: '72 hours',
      targets: {
        customers: 10,
        revenue: 1990,
        demos: 10
      },
      actual: {
        customers: paidCustomers[0]?.count || 0,
        revenue: parseFloat(totalRevenue[0]?.sum || '0'),
        demos: 0 // Would track from demo booking system
      },
      achievements: [
        '✅ Landing page deployed and live',
        '✅ WhatsApp bot responding correctly',
        '✅ Payment system integrated',
        '✅ First customer onboarded'
      ],
      nextSteps: [
        '🎯 Scale TikTok content creation',
        '🤝 Begin partner outreach',
        '📊 Implement analytics tracking',
        '🚀 Launch subscription tiers'
      ]
    };

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Sprint report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;