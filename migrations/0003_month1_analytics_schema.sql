-- Month 1: Analytics & Metrics Foundation Schema
-- Migration: 0003_month1_analytics_schema

-- Business Metrics Tracking
CREATE TABLE IF NOT EXISTS business_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('revenue', 'users', 'conversion', 'ltv', 'cac', 'churn')),
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Weekly Automated Filings Tracking
CREATE TABLE IF NOT EXISTS automated_filings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    filing_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    automation_level TEXT DEFAULT 'manual' CHECK (automation_level IN ('manual', 'semi_automated', 'fully_automated')),
    processing_time_seconds INTEGER,
    error_message TEXT,
    revenue_generated DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Customer Lifecycle Tracking
CREATE TABLE IF NOT EXISTS customer_lifecycle (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    stage TEXT NOT NULL CHECK (stage IN ('lead', 'trial', 'paying', 'churned', 'reactivated')),
    stage_entered_at TIMESTAMP DEFAULT NOW(),
    stage_duration_days INTEGER,
    conversion_source TEXT,
    ltv_calculated DECIMAL(10,2),
    cac_attributed DECIMAL(10,2)
);

-- Product Usage Analytics
CREATE TABLE IF NOT EXISTS product_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 1,
    session_duration_seconds INTEGER,
    date_used DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Compliance Health Scores
CREATE TABLE IF NOT EXISTS compliance_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    company_reg_number TEXT NOT NULL,
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    cipc_score INTEGER CHECK (cipc_score >= 0 AND cipc_score <= 100),
    tax_score INTEGER CHECK (tax_score >= 0 AND tax_score <= 100),
    bbee_score INTEGER CHECK (bbee_score >= 0 AND bbee_score <= 100),
    last_calculated TIMESTAMP DEFAULT NOW(),
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
);

-- Create indexes for analytics performance
CREATE INDEX IF NOT EXISTS idx_metrics_name_period ON business_metrics(metric_name, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_filings_user_date ON automated_filings(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_filings_status ON automated_filings(status);
CREATE INDEX IF NOT EXISTS idx_lifecycle_user ON customer_lifecycle(user_id);
CREATE INDEX IF NOT EXISTS idx_lifecycle_stage ON customer_lifecycle(stage);
CREATE INDEX IF NOT EXISTS idx_usage_user_date ON product_usage(user_id, date_used);
CREATE INDEX IF NOT EXISTS idx_compliance_user ON compliance_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_risk ON compliance_scores(risk_level);

-- Insert initial metric tracking records
INSERT INTO business_metrics (metric_name, metric_value, metric_type, period_start, period_end) VALUES
('weekly_automated_filings', 0, 'users', NOW() - INTERVAL '7 days', NOW()),
('ltv_cac_ratio', 0, 'conversion', NOW() - INTERVAL '30 days', NOW()),
('monthly_recurring_revenue', 0, 'revenue', NOW() - INTERVAL '30 days', NOW()),
('customer_acquisition_cost', 0, 'cac', NOW() - INTERVAL '30 days', NOW()),
('customer_lifetime_value', 0, 'ltv', NOW() - INTERVAL '30 days', NOW())
ON CONFLICT DO NOTHING;