-- MULTIPLY.AI Migration: Agent Infrastructure Tables
-- Apply via Supabase Dashboard → SQL Editor

-- 1. Church profiles (community intelligence)
CREATE TABLE IF NOT EXISTS church_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  weekly_attendance integer,
  congregation_size_category text,
  church_age_category text,
  percent_under_18 integer,
  percent_18_to_35 integer,
  percent_35_to_55 integer,
  percent_55_plus integer,
  ethnic_composition text,
  socioeconomic_background text,
  is_bivocational boolean DEFAULT false,
  staff_count integer DEFAULT 1,
  has_childrens_ministry boolean DEFAULT false,
  has_youth_ministry boolean DEFAULT false,
  preaching_style text DEFAULT 'topical',
  community_town text,
  community_state text,
  community_population integer,
  community_median_income integer,
  community_ethnic_demographics text,
  community_primary_industries text,
  community_population_trend text,
  community_distance_to_city integer,
  community_classification text,
  census_year integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE church_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own church profile" ON church_profiles
  FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- 2. Agent outputs (all 8 agents store results here)
CREATE TABLE IF NOT EXISTS agent_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id text NOT NULL,
  input_data jsonb NOT NULL DEFAULT '{}',
  output_json jsonb NOT NULL DEFAULT '{}',
  model_used text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE agent_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agent outputs" ON agent_outputs
  FOR ALL USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS agent_outputs_user_agent ON agent_outputs(user_id, agent_id);
CREATE INDEX IF NOT EXISTS agent_outputs_created ON agent_outputs(created_at DESC);

-- 3. Usage tracking (for tier enforcement)
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  agent_id text NOT NULL,
  month_year text NOT NULL,
  count integer DEFAULT 0,
  UNIQUE(user_id, agent_id, month_year)
);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own usage" ON usage_tracking
  FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Service role manages usage" ON usage_tracking
  FOR ALL USING (true);

-- 4. Add subscription_tier to profiles if not present
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS church_name text;
