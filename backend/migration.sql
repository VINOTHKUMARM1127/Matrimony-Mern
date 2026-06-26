-- ============================================================
-- Wedring Matrimony — LIVE SCHEMA REFERENCE
-- ============================================================
-- Pulled directly from the live Supabase project (pcdtgwelrwyvtqixqufc)
-- via information_schema on 2026-06-26. This is NOT a migration to run
-- against your existing database — every table here already exists live.
--
-- Purpose of this file:
--   1. A single accurate source-of-truth schema doc, to replace the
--      17+ overlapping/conflicting SQL files currently in supabase/.
--   2. A baseline to diff against `npx prisma db pull` output when
--      building the Express backend, so you can confirm Prisma's
--      introspected schema matches what's actually documented here.
--   3. Safe to run only against a FRESH/empty database (e.g. a staging
--      copy) to recreate this schema from scratch — every statement is
--      idempotent (IF NOT EXISTS), so it will no-op against the live DB.
--
-- Do NOT treat this as something to "apply" to production. Nothing here
-- changes a single row or column on the live database.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

-- ============================================================
-- Master data (location & religion — already populated live)
-- ============================================================

CREATE TABLE IF NOT EXISTS master_countries (
  id   integer PRIMARY KEY,
  name text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS master_states (
  id         integer PRIMARY KEY,
  country_id integer REFERENCES master_countries(id),
  name       text NOT NULL,
  UNIQUE (country_id, name)
);

CREATE TABLE IF NOT EXISTS master_districts (
  id       integer PRIMARY KEY,
  state_id integer REFERENCES master_districts(id),
  name     text NOT NULL,
  UNIQUE (state_id, name)
);

CREATE TABLE IF NOT EXISTS master_cities (
  id          integer PRIMARY KEY,
  district_id integer REFERENCES master_districts(id),
  name        text NOT NULL,
  UNIQUE (district_id, name)
);

CREATE TABLE IF NOT EXISTS master_religions (
  id   integer PRIMARY KEY,
  name text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS master_castes (
  id          integer PRIMARY KEY,
  religion_id integer REFERENCES master_religions(id),
  name        text NOT NULL,
  UNIQUE (religion_id, name)
);

-- ============================================================
-- Core identity
-- ============================================================

-- users.id references auth.users(id) on the live project (Supabase Auth).
CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text UNIQUE,
  phone         text UNIQUE,
  creating_for  text NOT NULL,
  mother_tongue text NOT NULL,
  is_verified   boolean DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

-- profiles.id IS the user id directly (no separate surrogate key) —
-- profiles.id -> users.id -> auth.users.id, all the same uuid.
CREATE TABLE IF NOT EXISTS profiles (
  id                        uuid PRIMARY KEY REFERENCES users(id),
  name                      text,
  gender                    text,
  date_of_birth             date,
  height_cm                 integer,
  weight_kg                 integer,
  physical_status           text,
  marital_status            text,
  religion                  text,
  caste                     text,
  subcaste                  text,
  about_me                  text,
  country                   text,
  state                     text,
  district                  text,
  city                      text,
  highest_qualification     text,
  education                 text,
  occupation                text,
  annual_income             text,
  languages_known           text[],
  hobbies                   text[],
  interests                 text[],
  food_habit                text,
  drinking_habit            text,
  smoking_habit             text,
  profile_completion        integer DEFAULT 0,
  is_active                 boolean DEFAULT true,
  last_active_at            timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now(),
  -- subscription/tier fields live directly on profiles, not a separate table
  tier                      text DEFAULT 'free',
  is_premium                boolean DEFAULT false,
  premium_expires_at        timestamptz,
  contacts_remaining        integer DEFAULT 0,
  interests_remaining       integer DEFAULT 0,
  horoscope_views_remaining integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS family_details (
  user_id            uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  father_name        text,
  mother_name        text,
  family_status      text,
  family_type        text,
  family_values      text,
  number_of_brothers integer DEFAULT 0,
  number_of_sisters  integer DEFAULT 0,
  updated_at         timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS horoscope_details (
  user_id         uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  rasi            text,
  nakshatra       text,
  lagnam          text,
  gothram         text,
  dosham          text,
  horoscope_notes text,
  dasa_balance    text,
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_preferences (
  user_id              uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  pref_age_min         integer DEFAULT 18,
  pref_age_max         integer DEFAULT 50,
  pref_height_min      integer DEFAULT 140,
  pref_height_max      integer DEFAULT 200,
  pref_marital_status  text[],
  pref_religion        text[],
  pref_caste           text[],
  pref_education       text[],
  pref_occupation      text[],
  pref_location        text[],
  pref_food_habit      text,
  updated_at           timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profile_photos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url     text NOT NULL,
  is_primary    boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_photos_user_id ON profile_photos(user_id);

CREATE TABLE IF NOT EXISTS admin_users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL UNIQUE,
  role       text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Subscription / distribution config
-- ============================================================

-- The canonical per-tier config table (admin panel reads/writes this).
CREATE TABLE IF NOT EXISTS subscription_plans (
  tier                          text PRIMARY KEY,
  plan_name                     text,
  price_inr                     integer DEFAULT 0,
  duration_months               integer DEFAULT 0,
  contacts_limit                integer DEFAULT 0,
  interests_limit               integer DEFAULT 0,
  initial_recommended_profiles  integer DEFAULT 5,  -- "All Matches" initial
  initial_nearby_profiles       integer DEFAULT 5,
  initial_daily_profiles        integer DEFAULT 5,  -- "Daily Updates" initial
  daily_recommended_increment   integer DEFAULT 0,  -- "All Matches" daily
  daily_nearby_increment        integer DEFAULT 0,
  daily_profiles_increment      integer DEFAULT 0,  -- "Daily Updates" daily
  horoscope_views_limit         integer DEFAULT 0,
  features                      jsonb DEFAULT '[]'::jsonb,
  color_code                    text DEFAULT '#AAAAAA',
  is_popular                    boolean DEFAULT false,
  updated_at                    timestamptz DEFAULT now()
);

-- Legacy mirror of subscription_plans, still read by admin/src/api/adminApi.js
-- in a few places — kept in sync by update_subscription_plan().
CREATE TABLE IF NOT EXISTS profile_distribution (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier                text NOT NULL UNIQUE,
  initial_all_matches integer DEFAULT 5,
  initial_new_profiles integer DEFAULT 0,
  daily_all_matches   integer DEFAULT 0,
  daily_new_profiles  integer DEFAULT 0,
  updated_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS distribution_settings_history (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier       text NOT NULL,
  settings   jsonb NOT NULL,
  changed_by text,
  push_mode  text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Distribution state & the actual feed pool
-- ============================================================

-- Per-user tracking of which tiers have already had Initial Distribution
-- granted, plus cumulative shown counters.
CREATE TABLE IF NOT EXISTS user_distribution_state (
  user_id                             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  highest_tier_ever_reached           text DEFAULT 'free',
  initial_distribution_granted_tiers  text[] DEFAULT '{}',
  recommended_profiles_shown          integer DEFAULT 0,
  nearby_profiles_shown               integer DEFAULT 0,
  daily_profiles_shown                integer DEFAULT 0,
  last_distribution_date              date,
  created_at                          timestamptz DEFAULT now(),
  updated_at                          timestamptz DEFAULT now()
);

-- Cumulative unlocked totals + the idempotency guard for the daily cron
-- (daily_last_run_date prevents the job from double-running per user/day).
CREATE TABLE IF NOT EXISTS user_profile_distribution (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  tier                      text DEFAULT 'free',
  total_recommended_unlocked integer DEFAULT 5,
  total_nearby_unlocked     integer DEFAULT 5,
  total_daily_unlocked      integer DEFAULT 5,
  last_distribution_date    date DEFAULT CURRENT_DATE,
  daily_last_run_date       date,
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

-- THE actual feed: one row per (user, candidate profile, section).
-- section is 'all_matches' | 'daily_updates' | 'nearby'.
-- priority_score drives ordering (DESC = newest first).
CREATE TABLE IF NOT EXISTS user_profile_pool (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE,
  profile_id          uuid REFERENCES users(id) ON DELETE CASCADE,
  section             text NOT NULL,
  compatibility_band  text,
  compatibility_score integer,
  priority_score      double precision NOT NULL DEFAULT 0,
  is_seen             boolean DEFAULT false,
  added_at            timestamptz DEFAULT now(),
  UNIQUE (user_id, profile_id, section)
);

CREATE INDEX IF NOT EXISTS idx_user_profile_pool_user_section
  ON user_profile_pool(user_id, section, priority_score DESC);

-- Per-section seen/today tracking (separate from the pool's is_seen flag).
CREATE TABLE IF NOT EXISTS user_profile_views (
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  section      text NOT NULL,
  profile_ids  uuid[] DEFAULT ARRAY[]::uuid[],
  todays_ids   uuid[] DEFAULT ARRAY[]::uuid[],
  todays_date  date,
  last_updated date DEFAULT CURRENT_DATE,
  PRIMARY KEY (user_id, section)
);

-- ============================================================
-- Credits wallet
-- ============================================================

CREATE TABLE IF NOT EXISTS user_wallet (
  user_id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_credits   integer DEFAULT 0,
  interest_credits  integer DEFAULT 0,
  horoscope_credits integer DEFAULT 0,
  updated_at        timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES users(id) ON DELETE CASCADE,
  type         text NOT NULL,
  credits_used integer DEFAULT 1,
  reference_id uuid,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);

-- ============================================================
-- Payments & subscriptions
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_type           text NOT NULL,
  status              text DEFAULT 'active',
  amount              integer DEFAULT 0,
  razorpay_payment_id text,
  contacts_added      integer DEFAULT 0,
  interests_added     integer DEFAULT 0,
  starts_at           timestamptz DEFAULT now(),
  expires_at          timestamptz,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- Paused (banked remaining days from a downgrade) or pending (queued
-- renewal/extension) plans. plan_tier/status drive activate_next_queued().
CREATE TABLE IF NOT EXISTS subscription_queue (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_tier        text NOT NULL,
  remaining_days   integer,
  duration_months  integer,
  contact_credits  integer DEFAULT 0,
  interest_credits integer DEFAULT 0,
  status           text NOT NULL DEFAULT 'pending',
  amount           integer,
  payment_id       text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid REFERENCES users(id) ON DELETE CASCADE,
  subscription_id        uuid REFERENCES subscriptions(id),
  plan_type              text NOT NULL,
  amount                 integer DEFAULT 0,
  tax                    integer DEFAULT 0,
  final_amount           integer DEFAULT 0,
  payment_gateway        text,
  gateway_transaction_id text,
  status                 text DEFAULT 'success',
  created_at             timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================================
-- Legacy / parallel tables — present live, but NOT the primary path.
-- Reconcile or formally deprecate before building new logic on these;
-- see "Open items" in the implementation plan.
-- ============================================================

CREATE TABLE IF NOT EXISTS membership_plans (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL UNIQUE,
  price_inr        integer DEFAULT 0,
  validity_days    integer DEFAULT 30,
  contact_credits  integer DEFAULT 0,
  interest_credits integer DEFAULT 0,
  is_active        boolean DEFAULT true,
  updated_at       timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_memberships (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid REFERENCES profiles(id),
  plan_id                     uuid REFERENCES membership_plans(id),
  tier                        text NOT NULL,
  start_date                  timestamptz DEFAULT now(),
  expiry_date                 timestamptz,
  contact_credits_remaining   integer DEFAULT 0,
  interest_credits_remaining  integer DEFAULT 0,
  status                      text DEFAULT 'active',
  queue_order                 integer DEFAULT 0,
  created_at                  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_history (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid REFERENCES profiles(id),
  plan_id            uuid REFERENCES membership_plans(id),
  tier               text NOT NULL,
  amount_paid        integer NOT NULL,
  payment_status     text DEFAULT 'pending',
  payment_gateway    text,
  gateway_reference  text,
  purchased_at       timestamptz DEFAULT now()
);

-- ============================================================
-- Engagement: interests, not-interested, moderation, activity
-- ============================================================

CREATE TABLE IF NOT EXISTS interests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status      text DEFAULT 'pending',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_interests_sender ON interests(sender_id);
CREATE INDEX IF NOT EXISTS idx_interests_receiver ON interests(receiver_id);

CREATE TABLE IF NOT EXISTS not_interested (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES users(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  restored_at   timestamptz,
  is_restored   boolean DEFAULT false,
  UNIQUE (user_id, target_user_id)
);

CREATE TABLE IF NOT EXISTS blocked_users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid REFERENCES profiles(id),
  blocked_id uuid REFERENCES profiles(id),
  reason     text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id       uuid REFERENCES profiles(id),
  reported_user_id  uuid REFERENCES profiles(id),
  reason            text NOT NULL,
  description       text,
  status            text DEFAULT 'pending',
  admin_notes       text,
  created_at        timestamptz DEFAULT now(),
  resolved_at       timestamptz
);

CREATE TABLE IF NOT EXISTS user_activity (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  target_user_id  uuid REFERENCES users(id),
  activity_type   text NOT NULL,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_target ON user_activity(target_user_id);

-- ============================================================
-- Admin reporting view (already live — included for reference only;
-- views can't be created with IF NOT EXISTS pre-PG16 in all setups,
-- so this uses OR REPLACE instead).
-- ============================================================

CREATE OR REPLACE VIEW v_distribution_health AS
SELECT
  sp.tier,
  sp.initial_recommended_profiles,
  sp.initial_nearby_profiles,
  sp.initial_daily_profiles,
  sp.daily_recommended_increment,
  sp.daily_nearby_increment,
  sp.daily_profiles_increment,
  count(upd.user_id)                         AS total_users,
  avg(upd.total_recommended_unlocked)::int   AS avg_recommended_unlocked,
  avg(upd.total_nearby_unlocked)::int        AS avg_nearby_unlocked,
  avg(upd.total_daily_unlocked)::int         AS avg_daily_unlocked,
  max(upd.last_distribution_date)            AS latest_distribution_date,
  count(*) FILTER (WHERE upd.last_distribution_date = CURRENT_DATE) AS users_updated_today
FROM subscription_plans sp
LEFT JOIN user_profile_distribution upd ON upd.tier = sp.tier
GROUP BY sp.tier, sp.initial_recommended_profiles, sp.initial_nearby_profiles,
         sp.initial_daily_profiles, sp.daily_recommended_increment,
         sp.daily_nearby_increment, sp.daily_profiles_increment;

-- ============================================================
-- Default subscription_plans data (only inserted if the tier row
-- doesn't already exist — safe no-op against the live DB, which
-- already has free/silver/gold/premium configured).
-- ============================================================

INSERT INTO subscription_plans (tier, plan_name, price_inr, duration_months)
VALUES
  ('free', 'Free', 0, 0),
  ('silver', 'Silver', 999, 3),
  ('gold', 'Gold', 1999, 6),
  ('premium', 'Premium', 3999, 12)
ON CONFLICT (tier) DO NOTHING;
