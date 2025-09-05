import { db } from '../../src/db/index.js';
import { users, complianceDeadlines } from '../../../shared/schema.js';
import { eq, and, lte, gte } from 'drizzle-orm';

export class DeadlineSentinelAgent {
  async activateForUser(userId: string, companyRegNumber: string) {
    console.log(`🎯 Activating Deadline Sentinel for company: ${companyRegNumber}`);
    
    // Fetch company incorporation date from CIPC API (mock implementation)
    const incorporationDate = await this.fetchIncorporationDate(companyRegNumber);
    
    if (!incorporationDate) {
      throw new Error('Could not fetch company incorporation date');
    }
    
    // Calculate all compliance deadlines
    const deadlines = this.calculateComplianceDeadlines(incorporationDate, companyRegNumber);
    
    // Save deadlines to database
    for (const deadline of deadlines) {
      await db.insert(complianceDeadlines).values({
        userId,
        companyRegNumber,
        deadlineType: deadline.type,
        dueDate: deadline.date,
        status: 'pending'
      }).onConflictDoNothing();
    }
    
    console.log(`✅ Set up ${deadlines.length} compliance deadlines`);
    return deadlines;
  }

  private async fetchIncorporationDate(companyRegNumber: string): Promise<Date | null> {
    try {
      // Parse company reg number to extract incorporation date
      // Format: YYYY/NNNNNN/NN where YYYY is year
      const year = companyRegNumber.substring(0, 4);
      const incorporationDate = new Date(`${year}-03-15`); // Default to March 15th
      
      // TODO: Replace with actual CIPC API call when available
      // const response = await fetch(`https://eservices.cipc.co.za/api/company/${companyRegNumber}`);
      // const data = await response.json();
      // return new Date(data.incorporationDate);
      
      return incorporationDate;
    } catch (error) {
      console.error('Error fetching incorporation date:', error);
      return null;
    }
  }

  private calculateComplianceDeadlines(incorporationDate: Date, companyRegNumber: string) {
    const deadlines = [];
    const currentYear = new Date().getFullYear();
    
    // Annual Return - due within 30 days of anniversary
    const annualReturnDate = new Date(incorporationDate);
    annualReturnDate.setFullYear(currentYear + 1);
    annualReturnDate.setDate(annualReturnDate.getDate() + 30);
    
    deadlines.push({
      type: 'annual_return' as const,
      date: annualReturnDate,
      description: 'Annual Return Filing'
    });
    
    // Beneficial Ownership - due by March 31st each year
    const boDeadline = new Date(currentYear + 1, 2, 31); // March 31st
    deadlines.push({
      type: 'beneficial_ownership' as const,
      date: boDeadline,
      description: 'Beneficial Ownership Declaration'
    });
    
    // AFS - due within 6 months of financial year end
    const afsDeadline = new Date(currentYear + 1, 8, 30); // Sept 30th (assuming Feb year-end)
    deadlines.push({
      type: 'afs_submission' as const,
      date: afsDeadline,
      description: 'Annual Financial Statements'
    });
    
    return deadlines;
  }

  async checkUpcomingDeadlines() {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
    
    // Get deadlines in the next 30 days
    const upcomingDeadlines = await db.select({
      deadline: complianceDeadlines,
      user: users
    })
    .from(complianceDeadlines)
    .innerJoin(users, eq(complianceDeadlines.userId, users.id))
    .where(
      and(
        lte(complianceDeadlines.dueDate, thirtyDaysFromNow),
        gte(complianceDeadlines.dueDate, now),
        eq(complianceDeadlines.status, 'pending')
      )
    );
    
    const notifications = [];
    
    for (const { deadline, user } of upcomingDeadlines) {
      const daysUntilDue = Math.ceil((deadline.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let urgency = 'normal';
      let message = '';
      
      if (daysUntilDue <= 7) {
        urgency = 'urgent';
        message = `🚨 *URGENT: ${this.getDeadlineDescription(deadline.deadlineType)}*\n\nDue in ${daysUntilDue} days!\n\nFile now with urgency processing: R${this.getUrgentPrice(deadline.deadlineType)}\nReply "${this.getServiceCode(deadline.deadlineType)}" to start`;
      } else if (daysUntilDue <= 14) {
        urgency = 'warning';
        message = `⚠️ *Reminder: ${this.getDeadlineDescription(deadline.deadlineType)}*\n\nDue in ${daysUntilDue} days\n\nFile now: R${this.getNormalPrice(deadline.deadlineType)}\nReply "${this.getServiceCode(deadline.deadlineType)}" to start`;
      } else {
        message = `📅 *Upcoming: ${this.getDeadlineDescription(deadline.deadlineType)}*\n\nDue in ${daysUntilDue} days\n\nPlan ahead: R${this.getNormalPrice(deadline.deadlineType)}\nReply "${this.getServiceCode(deadline.deadlineType)}" when ready`;
      }
      
      notifications.push({
        userId: user.id,
        phoneNumber: user.phoneNumber,
        deadlineId: deadline.id,
        urgency,
        message,
        daysUntilDue
      });
    }
    
    return notifications;
  }

  private getDeadlineDescription(type: string): string {
    const descriptions = {
      'annual_return': 'Annual Return Filing',
      'beneficial_ownership': 'Beneficial Ownership Declaration',
      'afs_submission': 'Annual Financial Statements',
      'tax_clearance': 'Tax Clearance Certificate'
    };
    return descriptions[type] || type;
  }

  private getServiceCode(type: string): string {
    const codes = {
      'annual_return': 'AR',
      'beneficial_ownership': 'BO',
      'afs_submission': 'AFS',
      'tax_clearance': 'TAX'
    };
    return codes[type] || type.toUpperCase();
  }

  private getNormalPrice(type: string): number {
    const prices = {
      'annual_return': 199,
      'beneficial_ownership': 99,
      'afs_submission': 249,
      'tax_clearance': 149
    };
    return prices[type] || 199;
  }

  private getUrgentPrice(type: string): number {
    return Math.round(this.getNormalPrice(type) * 1.5);
  }

  async markDeadlineCompleted(deadlineId: string) {
    await db.update(complianceDeadlines)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(complianceDeadlines.id, deadlineId));
  }

  async getComplianceScore(userId: string): Promise<{ score: number; issues: any[] }> {
    const userDeadlines = await db.select()
      .from(complianceDeadlines)
      .where(eq(complianceDeadlines.userId, userId));
    
    const now = new Date();
    const overdue = userDeadlines.filter(d => d.dueDate < now && d.status === 'pending');
    const upcoming = userDeadlines.filter(d => {
      const daysUntil = (d.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntil <= 30 && daysUntil > 0 && d.status === 'pending';
    });
    
    let score = 100;
    score -= overdue.length * 30; // -30 points per overdue item
    score -= upcoming.length * 10; // -10 points per upcoming item
    
    const issues = [
      ...overdue.map(d => ({
        type: 'overdue',
        description: `${this.getDeadlineDescription(d.deadlineType)} is overdue`,
        severity: 'high',
        action: `File now: R${this.getUrgentPrice(d.deadlineType)}`
      })),
      ...upcoming.map(d => ({
        type: 'upcoming',
        description: `${this.getDeadlineDescription(d.deadlineType)} due soon`,
        severity: 'medium',
        action: `File now: R${this.getNormalPrice(d.deadlineType)}`
      }))
    ];
    
    return { score: Math.max(0, score), issues };
  }
}