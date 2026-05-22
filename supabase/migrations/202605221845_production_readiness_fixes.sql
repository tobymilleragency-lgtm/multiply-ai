-- Multiply AI production readiness fixes
-- Adds columns used by the deployed API and keeps schema compatible with app code.

alter table public.profiles
  add column if not exists church_name text;

alter table public.church_profiles
  add column if not exists church_name text;

alter table public.agent_outputs
  add column if not exists model_used text;
