create table if not exists public.partners_new (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo text,
  type text not null default 'brand',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.partners_new
  add column if not exists type text;

alter table public.partners_new
  drop constraint if exists partners_new_type_check;

update public.partners_new
set type = case
  when lower(trim(name)) in (
    'rangaswamy college',
    'kl university',
    'amity university',
    'reva university',
    'presidency university',
    'sona'
  ) then 'hiring partners'
  else 'brand'
end;

alter table public.partners_new
  alter column type set default 'brand',
  alter column type set not null;

alter table public.partners_new
  add constraint partners_new_type_check
  check (type in ('brand', 'hiring partners'));

alter table public.partners_new enable row level security;

drop policy if exists "Public can read partners new" on public.partners_new;
create policy "Public can read partners new"
  on public.partners_new for select using (true);

drop policy if exists "Admins can manage partners new" on public.partners_new;
create policy "Admins can manage partners new"
  on public.partners_new for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');