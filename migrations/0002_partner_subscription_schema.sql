-- Partners table for referral program
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  type TEXT NOT NULL CHECK (type IN ('referral', 'reseller', 'enterprise')),
  company_name TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL UNIQUE,
  commission_rate DECIMAL(5,2) DEFAULT 20.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  total_referrals INTEGER DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Partner referrals tracking
CREATE TABLE IF NOT EXISTS partner_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  transaction_id UUID REFERENCES payg_transactions(id),
  commission_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  tier_id TEXT NOT NULL CHECK (tier_id IN ('growth', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),
  payment_reference TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add email field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- Add referral tracking to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES partners(referral_code);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_discount DECIMAL(5,2) DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partners_referral_code ON partners(referral_code);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner_id ON partner_referrals(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_customer_id ON partner_referrals(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);