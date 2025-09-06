import express from 'express';
import { db } from '../src/db/index.js';
import { partners, partnerReferrals, users, paygTransactions } from '../../shared/schema.js';
import { eq, and, gte, sum, count } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = express.Router();

// Partner registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, type, companyName } = req.body;
    
    const referralCode = generateReferralCode(name);
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    const [partner] = await db.insert(partners).values({
      name,
      email,
      phone,
      type,
      companyName,
      referralCode,
      apiKey,
      status: 'pending'
    }).returning();

    res.json({
      success: true,
      partner: {
        id: partner.id,
        referralCode: partner.referralCode,
        status: partner.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Partner login
router.post('/login', async (req, res) => {
  try {
    const { email, referralCode } = req.body;
    
    const [partner] = await db.select()
      .from(partners)
      .where(and(
        eq(partners.email, email),
        eq(partners.referralCode, referralCode)
      ))
      .limit(1);

    if (!partner) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { partnerId: partner.id, type: partner.type },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      partner: {
        id: partner.id,
        name: partner.name,
        type: partner.type,
        referralCode: partner.referralCode,
        commissionRate: partner.commissionRate
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get partner dashboard data
router.get('/dashboard', authenticatePartner, async (req, res) => {
  try {
    const partnerId = req.partnerId;
    
    // Get referral stats
    const referralStats = await db.select({
      totalReferrals: count(),
      totalCommission: sum(partnerReferrals.commissionAmount)
    })
    .from(partnerReferrals)
    .where(eq(partnerReferrals.partnerId, partnerId));

    // Get recent referrals
    const recentReferrals = await db.select({
      id: partnerReferrals.id,
      customerName: users.fullName,
      customerPhone: users.phoneNumber,
      commissionAmount: partnerReferrals.commissionAmount,
      status: partnerReferrals.status,
      createdAt: partnerReferrals.createdAt
    })
    .from(partnerReferrals)
    .leftJoin(users, eq(partnerReferrals.customerId, users.id))
    .where(eq(partnerReferrals.partnerId, partnerId))
    .orderBy(partnerReferrals.createdAt)
    .limit(10);

    // Get monthly performance
    const monthlyStats = await getMonthlyStats(partnerId);

    res.json({
      success: true,
      stats: referralStats[0],
      recentReferrals,
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ error: 'Dashboard data fetch failed' });
  }
});

// Generate referral link
router.get('/referral-link', authenticatePartner, async (req, res) => {
  try {
    const [partner] = await db.select()
      .from(partners)
      .where(eq(partners.id, req.partnerId))
      .limit(1);

    const referralLink = `https://cipcagent.co.za/ref/${partner.referralCode}`;
    
    res.json({
      success: true,
      referralLink,
      referralCode: partner.referralCode
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate link' });
  }
});

// Track referral conversion
router.post('/track-conversion', async (req, res) => {
  try {
    const { referralCode, customerId, transactionId } = req.body;
    
    const [partner] = await db.select()
      .from(partners)
      .where(eq(partners.referralCode, referralCode))
      .limit(1);

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    const [transaction] = await db.select()
      .from(paygTransactions)
      .where(eq(paygTransactions.id, transactionId))
      .limit(1);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const commissionAmount = calculateCommission(
      parseFloat(transaction.amount),
      partner.commissionRate
    );

    await db.insert(partnerReferrals).values({
      partnerId: partner.id,
      customerId,
      transactionId,
      commissionAmount: commissionAmount.toString(),
      status: 'pending'
    });

    res.json({ success: true, commissionAmount });
  } catch (error) {
    res.status(500).json({ error: 'Conversion tracking failed' });
  }
});

function generateReferralCode(name: string): string {
  const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean.substring(0, 4)}${random}`;
}

function calculateCommission(amount: number, rate: number): number {
  return Math.round(amount * (rate / 100) * 100) / 100;
}

async function getMonthlyStats(partnerId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  return await db.select({
    month: partnerReferrals.createdAt,
    referrals: count(),
    commission: sum(partnerReferrals.commissionAmount)
  })
  .from(partnerReferrals)
  .where(and(
    eq(partnerReferrals.partnerId, partnerId),
    gte(partnerReferrals.createdAt, thirtyDaysAgo)
  ))
  .groupBy(partnerReferrals.createdAt);
}

function authenticatePartner(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.partnerId = decoded.partnerId;
    req.partnerType = decoded.type;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export default router;