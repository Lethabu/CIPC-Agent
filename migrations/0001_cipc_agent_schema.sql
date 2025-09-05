-- CIPC Agent Platform Database Schema
-- Migration: 0001_cipc_agent_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT NOT NULL UNIQUE,
    full_name TEXT,
    id_number TEXT,
    company_reg_number TEXT,
    subscription_tier TEXT DEFAULT 'freemium' CHECK (subscription_tier IN ('freemium', 'starter', 'growth', 'enterprise')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    consent_given BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMP
);

-- PAYG Transactions table
CREATE TABLE IF NOT EXISTS payg_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    service_type TEXT NOT NULL CHECK (service_type IN ('beneficial_ownership', 'director_amendment', 'annual_return', 'bbee_certificate', 'afs_submission', 'company_update')),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_reference TEXT,
    urgency_fee BOOLEAN DEFAULT FALSE,
    filing_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Compliance Deadlines table
CREATE TABLE IF NOT EXISTS compliance_deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    company_reg_number TEXT NOT NULL,
    deadline_type TEXT NOT NULL CHECK (deadline_type IN ('annual_return', 'beneficial_ownership', 'afs_submission', 'tax_clearance')),
    due_date TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
    reminders_sent INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lead Scout Results table
CREATE TABLE IF NOT EXISTS lead_scout_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'news')),
    content TEXT NOT NULL,
    author_handle TEXT,
    lead_score INTEGER NOT NULL CHECK (lead_score >= 0 AND lead_score <= 100),
    extracted_company_info JSONB,
    contact_attempted BOOLEAN DEFAULT FALSE,
    contacted_at TIMESTAMP,
    conversion_status TEXT DEFAULT 'pending' CHECK (conversion_status IN ('pending', 'contacted', 'converted', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pricing Configuration table
CREATE TABLE IF NOT EXISTS pricing_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_type TEXT NOT NULL UNIQUE,
    base_price DECIMAL(10,2) NOT NULL,
    urgency_multiplier DECIMAL(3,2) DEFAULT 1.5,
    subscription_tiers JSONB,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_reg_number);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON payg_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON payg_transactions(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON compliance_deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON compliance_deadlines(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_user ON compliance_deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_score ON lead_scout_results(lead_score);
CREATE INDEX IF NOT EXISTS idx_leads_status ON lead_scout_results(conversion_status);
CREATE INDEX IF NOT EXISTS idx_leads_platform ON lead_scout_results(platform);

-- Insert default pricing configuration
INSERT INTO pricing_config (service_type, base_price, urgency_multiplier, subscription_tiers) VALUES
('beneficial_ownership', 99.00, 1.5, '{"growth": true, "enterprise": true}'),
('director_amendment', 149.00, 1.5, '{"growth": true, "enterprise": true}'),
('annual_return', 199.00, 1.5, '{"growth": true, "enterprise": true}'),
('bbee_certificate', 199.00, 1.5, '{"enterprise": true}'),
('afs_submission', 249.00, 1.5, '{"growth": true, "enterprise": true}'),
('company_update', 299.00, 1.5, '{"growth": true, "enterprise": true}')
ON CONFLICT (service_type) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_config_updated_at BEFORE UPDATE ON pricing_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();