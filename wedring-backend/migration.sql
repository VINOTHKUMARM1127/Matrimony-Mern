-- ============================================================
-- Wedring Matrimony — Database Migration
-- ============================================================
-- Run this against your Supabase PostgreSQL database.
-- REVIEW CAREFULLY before executing — this creates new tables.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Core user record (linked to Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  mobile text UNIQUE,
  profile_for text DEFAULT 'myself',
  mother_tongue text,
  membership_tier text DEFAULT 'free',
  profile_complete_pct integer DEFAULT 0,
  fcm_token text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- Full profile
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name text,
  gender text,
  dob date,
  height_cm integer,
  marital_status text,
  religion text,
  caste text,
  highest_qualification text,
  occupation text,
  annual_income text,
  family_details jsonb,
  state text,
  district text,
  city text,
  about_me text,
  rasi text,
  nakshatra text,
  lagnam text,
  gothram text,
  dosham text,
  languages_known text[],
  hobbies text[],
  interests text[],
  lifestyle_prefs jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- Partner preferences
-- ============================================================
CREATE TABLE IF NOT EXISTS partner_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  age_min integer,
  age_max integer,
  height_min_cm integer,
  height_max_cm integer,
  marital_status text[],
  religion text[],
  caste text[],
  education text[],
  occupation text[],
  food_habits text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- Profile photos
-- ============================================================
CREATE TABLE IF NOT EXISTS profile_photos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  r2_key text,
  r2_url text,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_photos_user_id ON profile_photos(user_id);

-- ============================================================
-- Membership plans (admin-configured)
-- ============================================================
CREATE TABLE IF NOT EXISTS membership_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  price decimal DEFAULT 0,
  validity_days integer DEFAULT 30,
  contact_credits integer DEFAULT 0,
  interest_credits integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default plans
INSERT INTO membership_plans (name, price, validity_days, contact_credits, interest_credits) VALUES
  ('free', 0, 36500, 0, 3),
  ('silver', 999, 90, 30, 50),
  ('gold', 1999, 180, 60, 100),
  ('platinum', 3999, 365, 150, 999)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- User memberships (active + queued)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_memberships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES membership_plans(id),
  status text DEFAULT 'active',
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  contact_credits_remaining integer DEFAULT 0,
  interest_credits_remaining integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_memberships_user_id ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);

-- ============================================================
-- Credit transactions log
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  credits_deducted integer DEFAULT 1,
  target_user_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);

-- ============================================================
-- Payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES membership_plans(id),
  amount decimal DEFAULT 0,
  currency text DEFAULT 'INR',
  payment_status text DEFAULT 'pending',
  payment_gateway text,
  transaction_ref text,
  verified_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- ============================================================
-- Interests
-- ============================================================
CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_interests_sender ON interests(sender_id);
CREATE INDEX IF NOT EXISTS idx_interests_receiver ON interests(receiver_id);

-- ============================================================
-- Not interested
-- ============================================================
CREATE TABLE IF NOT EXISTS not_interested (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, target_user_id)
);

-- ============================================================
-- User Activity Logs
-- ============================================================
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_target ON user_activity(target_user_id);

-- ============================================================
-- Distribution config (admin-managed per tier)
-- ============================================================
CREATE TABLE IF NOT EXISTS distribution_config (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier text UNIQUE NOT NULL,
  section text DEFAULT 'all_matches',
  initial_count integer DEFAULT 50,
  daily_count integer DEFAULT 5,
  updated_at timestamptz DEFAULT now()
);

-- Insert default configs
INSERT INTO distribution_config (tier, initial_count, daily_count) VALUES
  ('free', 20, 3),
  ('silver', 50, 5),
  ('gold', 100, 10),
  ('platinum', 200, 20)
ON CONFLICT (tier) DO NOTHING;

-- ============================================================
-- Distributed profiles per user
-- ============================================================
CREATE TABLE IF NOT EXISTS user_distributed_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES users(id) ON DELETE CASCADE,
  section text DEFAULT 'all_matches',
  distributed_at timestamptz DEFAULT now(),
  is_new boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_distributed_user ON user_distributed_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_distributed_section ON user_distributed_profiles(user_id, section);

-- ============================================================
-- Track initial distribution done per tier per user
-- ============================================================
CREATE TABLE IF NOT EXISTS user_distribution_state (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  tier text NOT NULL,
  initial_done boolean DEFAULT false,
  last_daily_run date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tier)
);

-- ============================================================
-- FCM notification log
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text,
  body text,
  type text,
  data jsonb,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ============================================================
-- Admin users table (for admin role checks)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Row Level Security Policies
-- ============================================================

-- Users can read their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Service role full access on users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Profiles: users can read all active, write own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Anyone can view active profiles" ON profiles
  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Service role full access on profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Photos: users can manage own photos
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view all photos" ON profile_photos
  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can manage own photos" ON profile_photos
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Service role full access on photos" ON profile_photos
  FOR ALL USING (auth.role() = 'service_role');

-- Interests
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own interests" ON interests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY IF NOT EXISTS "Service role full access on interests" ON interests
  FOR ALL USING (auth.role() = 'service_role');

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Service role full access on notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

-- Membership plans: public read
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Anyone can view plans" ON membership_plans
  FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Service role full access on plans" ON membership_plans
  FOR ALL USING (auth.role() = 'service_role');
