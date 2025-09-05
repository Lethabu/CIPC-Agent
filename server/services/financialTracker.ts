import { db } from '../src/db/index.js';
import { users, paygTransactions } from '../../shared/schema.js';
import { eq, sum, count, gte, sql } from 'drizzle-orm';

export class FinancialTracker {
  async getSprintMetrics() {
    const today = new Date();
    const sprintStart = new Date(today.getTime() - (3 * 24 * 60 * 60 * 1000)); // 3 days ago
    
    const [userStats, transactionStats, revenueStats] = await Promise.all([
      this.getUserStats(sprintStart),
      this.getTransactionStats(sprintStart),
      this.getRevenueStats(sprintStart)
    ]);
    
    return {
      sprint: {
        totalUsers: userStats.total,
        newUsers: userStats.new,
        transactions: transactionStats.total,
        paidTransactions: transactionStats.paid,
        revenue: revenueStats.total,
        conversionRate: this.calculateConversionRate(userStats.new, transactionStats.paid)
      },
      projections: this.calculateProjections(revenueStats.total, transactionStats.paid)
    };
  }

  private async getUserStats(since: Date) {
    const [total, newUsers] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(users).where(gte(users.createdAt, since))
    ]);
    
    return {
      total: total[0].count,
      new: newUsers[0].count
    };
  }

  private async getTransactionStats(since: Date) {
    const [total, paid] = await Promise.all([
      db.select({ count: count() }).from(paygTransactions).where(gte(paygTransactions.createdAt, since)),
      db.select({ count: count() }).from(paygTransactions)
        .where(sql`${paygTransactions.createdAt} >= ${since} AND ${paygTransactions.status} = 'paid'`)
    ]);
    
    return {
      total: total[0].count,
      paid: paid[0].count
    };
  }

  private async getRevenueStats(since: Date) {
    const result = await db.select({ 
      total: sum(paygTransactions.amount) 
    })
    .from(paygTransactions)
    .where(sql`${paygTransactions.createdAt} >= ${since} AND ${paygTransactions.status} = 'paid'`);
    
    return {
      total: parseFloat(result[0].total || '0')
    };
  }

  private calculateConversionRate(newUsers: number, paidTransactions: number): string {
    if (newUsers === 0) return '0%';
    return ((paidTransactions / newUsers) * 100).toFixed(1) + '%';
  }

  private calculateProjections(currentRevenue: number, currentTransactions: number) {
    const avgOrderValue = currentTransactions > 0 ? currentRevenue / currentTransactions : 199;
    
    // 18-month projections based on current performance
    const monthlyGrowthRate = 1.5; // 50% month-over-month growth
    const projections = [];
    
    let monthlyRevenue = currentRevenue * 30; // Extrapolate daily to monthly
    let monthlyTransactions = currentTransactions * 30;
    
    for (let month = 1; month <= 18; month++) {
      monthlyRevenue *= monthlyGrowthRate;
      monthlyTransactions *= monthlyGrowthRate;
      
      projections.push({
        month,
        revenue: Math.round(monthlyRevenue),
        transactions: Math.round(monthlyTransactions),
        arr: Math.round(monthlyRevenue * 12) // Annualized
      });
    }
    
    return {
      avgOrderValue: Math.round(avgOrderValue),
      projections: projections.filter(p => [3, 6, 12, 18].includes(p.month))
    };
  }

  async trackManualFiling(phoneNumber: string, serviceType: string, amount: number) {
    // Find user
    const user = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
    if (user.length === 0) {
      throw new Error('User not found');
    }
    
    // Create transaction record
    const transaction = await db.insert(paygTransactions).values({
      userId: user[0].id,
      serviceType: this.mapServiceType(serviceType),
      amount: amount.toString(),
      status: 'paid', // Manual filings are pre-paid
      paymentReference: `MANUAL-${Date.now()}`,
      completedAt: new Date()
    }).returning();
    
    // Update user total spent
    await db.update(users)
      .set({ 
        totalSpent: sql`total_spent + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, user[0].id));
    
    return transaction[0];
  }

  private mapServiceType(serviceType: string): string {
    const mapping = {
      'Annual Return': 'annual_return',
      'Beneficial Ownership': 'beneficial_ownership',
      'Director Amendment': 'director_amendment',
      'B-BBEE Certificate': 'bbee_certificate',
      'AFS Submission': 'afs_submission',
      'Company Update': 'company_update'
    };
    
    return mapping[serviceType] || 'annual_return';
  }

  async getRevenueGoalProgress() {
    const goals = {
      month3: 240000,   // R240k monthly
      month6: 1650000,  // R1.65M monthly  
      month12: 10200000, // R10.2M monthly
      month18: 25000000  // R25M ARR target
    };
    
    const currentMetrics = await this.getSprintMetrics();
    const currentMonthlyRevenue = currentMetrics.sprint.revenue * 30; // Extrapolate
    
    return {
      current: {
        monthly: Math.round(currentMonthlyRevenue),
        arr: Math.round(currentMonthlyRevenue * 12)
      },
      goals,
      progress: {
        month3: (currentMonthlyRevenue / goals.month3) * 100,
        month6: (currentMonthlyRevenue / goals.month6) * 100,
        month12: (currentMonthlyRevenue / goals.month12) * 100,
        month18: ((currentMonthlyRevenue * 12) / goals.month18) * 100
      }
    };
  }
}