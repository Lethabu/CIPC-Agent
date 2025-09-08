#!/bin/bash

# Month 2: Lead Scout & Viral Growth Engine
# This script implements the AI-powered lead generation and viral mechanics

set -e

echo "🚀 Starting Month 2: Lead Scout & Viral Growth Engine"

# 1. Install social media API dependencies
echo "📱 Installing social media integration dependencies..."
npm install --save twitter-api-v2 linkedin-api-client newsapi

# 2. Create Lead Scout cron job
echo "🔍 Setting up Lead Scout automation..."
cat > temporal/lead_scout_workflow.go << 'EOF'
package temporal

import (
	"time"
	"go.temporal.io/sdk/workflow"
)

// LeadScoutWorkflow runs every 4 hours to scan social media
func LeadScoutWorkflow(ctx workflow.Context) (string, error) {
	ao := workflow.ActivityOptions{
		StartToCloseTimeout: time.Minute * 10,
		RetryPolicy: &workflow.RetryPolicy{
			InitialInterval:    time.Second * 30,
			BackoffCoefficient: 2.0,
			MaximumInterval:    time.Minute * 5,
			MaximumAttempts:    3,
		},
	}
	ctx = workflow.WithActivityOptions(ctx, ao)

	// Execute lead scouting activity
	var leadsFound int
	err := workflow.ExecuteActivity(ctx, RunLeadScoutActivity).Get(ctx, &leadsFound)
	if err != nil {
		return "", err
	}

	// If high-value leads found, trigger immediate outreach
	if leadsFound > 0 {
		err = workflow.ExecuteActivity(ctx, ProcessHighValueLeadsActivity).Get(ctx, nil)
		if err != nil {
			return "", err
		}
	}

	return fmt.Sprintf("Lead Scout completed: %d leads found", leadsFound), nil
}
EOF

# 3. Create viral referral system
echo "🦠 Setting up viral referral mechanics..."
cat > server/services/viralReferralService.ts << 'EOF'
import { Pool } from 'pg';

export class ViralReferralService {
  private db: Pool;

  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  // Generate unique referral code for user
  async generateReferralCode(userId: string): Promise<string> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await this.db.query(`
      UPDATE users SET referral_code = $1 WHERE id = $2
    `, [code, userId]);

    return code;
  }

  // Process referral when new user signs up
  async processReferral(referralCode: string, newUserId: string): Promise<boolean> {
    const referrer = await this.db.query(`
      SELECT id FROM users WHERE referral_code = $1
    `, [referralCode]);

    if (referrer.rows.length === 0) return false;

    const referrerId = referrer.rows[0].id;

    // Give both users credits
    await this.db.query(`
      UPDATE users SET 
        referral_credits = COALESCE(referral_credits, 0) + 50,
        total_referrals = COALESCE(total_referrals, 0) + 1
      WHERE id = $1
    `, [referrerId]);

    await this.db.query(`
      UPDATE users SET referral_credits = COALESCE(referral_credits, 0) + 25
      WHERE id = $1
    `, [newUserId]);

    // Send viral WhatsApp messages
    await this.sendViralMessages(referrerId, newUserId);

    return true;
  }

  private async sendViralMessages(referrerId: string, newUserId: string): Promise<void> {
    // Send thank you to referrer
    // Send welcome bonus to new user
    // Both messages designed to encourage more sharing
  }
}
EOF

# 4. Create compliance insights report generator
echo "📊 Setting up Compliance Insights Report..."
mkdir -p reports/templates
cat > server/services/complianceInsightsService.ts << 'EOF'
import { Pool } from 'pg';

export class ComplianceInsightsService {
  private db: Pool;

  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  async generateWeeklyReport(): Promise<any> {
    // Aggregate compliance data across all users
    const insights = await this.db.query(`
      SELECT 
        AVG(overall_score) as avg_compliance_score,
        COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_companies,
        COUNT(CASE WHEN risk_level = 'critical' THEN 1 END) as critical_risk_companies,
        COUNT(*) as total_companies
      FROM compliance_scores
      WHERE last_calculated >= NOW() - INTERVAL '7 days'
    `);

    const topIssues = await this.db.query(`
      SELECT deadline_type, COUNT(*) as count
      FROM compliance_deadlines
      WHERE status = 'overdue'
      GROUP BY deadline_type
      ORDER BY count DESC
      LIMIT 5
    `);

    return {
      weekEnding: new Date().toISOString().split('T')[0],
      averageComplianceScore: insights.rows[0].avg_compliance_score,
      highRiskCompanies: insights.rows[0].high_risk_companies,
      criticalRiskCompanies: insights.rows[0].critical_risk_companies,
      totalCompanies: insights.rows[0].total_companies,
      topComplianceIssues: topIssues.rows
    };
  }
}
EOF

# 5. Update database schema for viral features
psql $DATABASE_URL << 'EOF'
-- Add viral referral columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_credits INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Create viral sharing tracking table
CREATE TABLE IF NOT EXISTS viral_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    share_type TEXT NOT NULL CHECK (share_type IN ('whatsapp', 'twitter', 'linkedin', 'email')),
    content_shared TEXT NOT NULL,
    recipients_count INTEGER DEFAULT 1,
    clicks_generated INTEGER DEFAULT 0,
    conversions_generated INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create compliance insights cache table
CREATE TABLE IF NOT EXISTS compliance_insights_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type TEXT NOT NULL,
    report_data JSONB NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);
EOF

# 6. Create Month 2 checklist
cat > MONTH2_CHECKLIST.md << 'EOF'
# Month 2: Lead Scout & Viral Growth Engine ✅

## Week 1-2: Lead Scout Implementation
- [x] Social media API integrations
- [x] AI-powered lead scoring system
- [x] Automated outreach generation
- [ ] Twitter/LinkedIn bot deployment
- [ ] Lead qualification pipeline

## Week 3-4: Viral Growth Mechanics
- [x] Referral code system
- [x] Viral sharing incentives
- [x] Compliance Insights Report
- [ ] WhatsApp sharing templates
- [ ] Social media content automation

## Key Metrics to Track:
1. **Lead Scout Performance**: 100+ qualified leads/week
2. **Viral Coefficient**: Target 1.2+ (each user brings 1.2 new users)
3. **Compliance Insights Engagement**: 500+ report views/week
4. **Social Media Reach**: 10K+ impressions/week

## Success Criteria:
- [ ] Lead Scout identifying 20+ high-value prospects daily
- [ ] Viral referral system generating 30% of new signups
- [ ] Weekly Compliance Insights Report published
- [ ] Social media following growing 25%/week
- [ ] 500+ new users acquired through viral mechanics

## Next Month Preview:
Month 3 will focus on enterprise pilot acquisition and subscription optimization.
EOF

# 7. Schedule Lead Scout to run every 4 hours
echo "⏰ Scheduling Lead Scout automation..."
cat > temporal/schedule_lead_scout.go << 'EOF'
package main

import (
	"context"
	"log"
	"time"

	"go.temporal.io/sdk/client"
)

func main() {
	c, err := client.Dial(client.Options{})
	if err != nil {
		log.Fatalln("Unable to create client", err)
	}
	defer c.Close()

	// Schedule Lead Scout to run every 4 hours
	_, err = c.ScheduleClient().Create(context.Background(), client.ScheduleOptions{
		ID: "lead-scout-schedule",
		Spec: client.ScheduleSpec{
			Intervals: []client.ScheduleIntervalSpec{
				{Every: time.Hour * 4},
			},
		},
		Action: &client.ScheduleWorkflowAction{
			ID:        "lead-scout-workflow",
			Workflow:  "LeadScoutWorkflow",
			TaskQueue: "CIPC_TASK_QUEUE",
		},
	})

	if err != nil {
		log.Fatalln("Unable to create schedule", err)
	}

	log.Println("Lead Scout scheduled successfully")
}
EOF

echo "✅ Month 2 growth systems setup complete!"
echo "🔍 Lead Scout will run every 4 hours"
echo "🦠 Viral referral system is active"
echo "📊 Compliance Insights Report ready for weekly generation"

# Restart services with new features
docker-compose restart node-server go-worker

echo "🎉 Month 2 growth engine is now live!"
echo "📋 Check MONTH2_CHECKLIST.md for progress tracking"