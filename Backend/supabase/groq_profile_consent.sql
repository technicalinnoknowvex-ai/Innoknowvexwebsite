alter table public.user_profiles_new
  add column if not exists ai_personalization_consent_provider text;
