create table if not exists public.blogs_new (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text,
  description text not null,
  link text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blogs_new enable row level security;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_blogs_new on public.blogs_new;
create trigger set_updated_at_blogs_new
before update on public.blogs_new
for each row
execute function public.set_updated_at();

drop policy if exists "Public can read blogs new" on public.blogs_new;
create policy "Public can read blogs new"
  on public.blogs_new for select
  using (true);

drop policy if exists "Admins can manage blogs new" on public.blogs_new;
create policy "Admins can manage blogs new"
  on public.blogs_new for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
