create table if not exists public.partners_new (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.partners_new enable row level security;

drop policy if exists "Public can read partners new" on public.partners_new;
create policy "Public can read partners new"
  on public.partners_new for select using (true);

drop policy if exists "Admins can manage partners new" on public.partners_new;
create policy "Admins can manage partners new"
  on public.partners_new for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.partners_new (name, logo)
values
  ('IBM', null),
  ('PPG Business School', null),
  ('M.A.M College', null)
on conflict do nothing;