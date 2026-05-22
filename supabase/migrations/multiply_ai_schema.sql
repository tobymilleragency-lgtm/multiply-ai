-- MULTIPLY.AI Agent Infrastructure Tables
-- Run this in Supabase Dashboard → SQL Editor

create table if not exists church_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  church_name text,
  weekly_attendance integer,
  congregation_size_category text,
  church_age_category text,
  percent_under_18 integer default 0,
  percent_18_to_35 integer default 0,
  percent_35_to_55 integer default 0,
  percent_55_plus integer default 0,
  ethnic_composition text,
  socioeconomic_background text,
  is_bivocational boolean default false,
  staff_count integer default 1,
  has_childrens_ministry boolean default false,
  has_youth_ministry boolean default false,
  preaching_style text default 'topical',
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
  census_source text,
  census_poverty_count integer,
  census_median_age numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists agent_outputs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  agent_id text not null,
  input_data jsonb,
  output_json jsonb,
  model_used text,
  created_at timestamptz default now()
);

create table if not exists usage_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  agent_id text not null,
  month_year text not null,
  count integer default 0,
  created_at timestamptz default now(),
  unique(user_id, agent_id, month_year)
);

alter table church_profiles enable row level security;
alter table agent_outputs enable row level security;
alter table usage_tracking enable row level security;

create policy "Users manage own church profile"
  on church_profiles for all
  using (auth.uid() = user_id);

create policy "Users manage own agent outputs"
  on agent_outputs for all
  using (auth.uid() = user_id);

create policy "Users manage own usage tracking"
  on usage_tracking for all
  using (auth.uid() = user_id);
