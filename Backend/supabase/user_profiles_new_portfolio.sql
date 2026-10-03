alter table public.user_profiles_new
  add column if not exists skills text[] not null default '{}';

alter table public.user_profiles_new
  add column if not exists projects jsonb not null default '[]'::jsonb
  check (jsonb_typeof(projects) = 'array');

notify pgrst, 'reload schema';
