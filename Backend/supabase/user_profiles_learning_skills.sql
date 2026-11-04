alter table public.user_profiles_new
  add column if not exists skills text[] not null default '{}',
  add column if not exists learning_skills text[] not null default '{}',
  add column if not exists projects jsonb not null default '[]'::jsonb,
  add column if not exists current_status text,
  add column if not exists education_level text,
  add column if not exists experience jsonb not null default '[]'::jsonb,
  add column if not exists interests text[] not null default '{}',
  add column if not exists goals text[] not null default '{}',
  add column if not exists ai_personalization_consent boolean not null default false,
  add column if not exists onboarding_completed boolean not null default false;

alter table public.user_profiles_new enable row level security;

grant select, insert, update on public.user_profiles_new to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles_new'
      and policyname = 'user_profiles_new_select_own'
  ) then
    create policy user_profiles_new_select_own
      on public.user_profiles_new
      for select
      to authenticated
      using ((select auth.uid()) = id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles_new'
      and policyname = 'user_profiles_new_insert_own'
  ) then
    create policy user_profiles_new_insert_own
      on public.user_profiles_new
      for insert
      to authenticated
      with check ((select auth.uid()) = id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_profiles_new'
      and policyname = 'user_profiles_new_update_own'
  ) then
    create policy user_profiles_new_update_own
      on public.user_profiles_new
      for update
      to authenticated
      using ((select auth.uid()) = id)
      with check ((select auth.uid()) = id);
  end if;
end
$$;
