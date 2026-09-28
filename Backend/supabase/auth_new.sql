-- Supabase Auth stores accounts in its managed auth.users table.
-- The application-owned profile table intentionally includes "new" in its name.

create table if not exists public.user_profiles_new (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles_new
  add column if not exists full_name text;

alter table public.user_profiles_new
  add column if not exists email text;

alter table public.user_profiles_new enable row level security;

create policy "Users can read their own new profile"
  on public.user_profiles_new for select
  using (auth.uid() = id);

create policy "Users can update their own new profile"
  on public.user_profiles_new for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert their own new profile"
  on public.user_profiles_new for insert
  with check (auth.uid() = id);

create or replace function public.handle_new_user_new()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles_new (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created_new
  after insert on auth.users
  for each row execute procedure public.handle_new_user_new();