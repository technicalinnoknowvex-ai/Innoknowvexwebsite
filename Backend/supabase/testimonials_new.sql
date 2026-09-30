create table if not exists public.testimonials_new (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  profile_image text,
  designation text,
  program text,
  rating numeric(2, 1) not null check (rating >= 1 and rating <= 5),
  content text not null,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected')),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.testimonials_new enable row level security;

drop policy if exists "Public can read approved testimonials new" on public.testimonials_new;
drop policy if exists "Public can read all testimonials new" on public.testimonials_new;
create policy "Public can read all testimonials new"
  on public.testimonials_new for select
  using (true);

drop policy if exists "Admins can manage testimonials new" on public.testimonials_new;
create policy "Admins can manage testimonials new"
  on public.testimonials_new for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');