create table if not exists public.program_categories_new (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programs_new (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  short_description text,
  image_url text,
  brochure_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  internship boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.programs_new add column if not exists image_url text;
alter table public.programs_new add column if not exists brochure_url text;
alter table public.programs_new drop column if exists description;
alter table public.programs_new drop column if exists tag;
alter table public.programs_new drop column if exists hero_image;
alter table public.programs_new drop column if exists popular;
alter table public.programs_new drop column if exists duration;
alter table public.programs_new drop column if exists hours;
alter table public.programs_new drop column if exists project_count;
alter table public.programs_new drop column if exists certificate;
alter table public.programs_new drop column if exists placement_support;
alter table public.programs_new drop column if exists original_price;
alter table public.programs_new drop column if exists price;
alter table public.programs_new drop column if exists discount;

alter table public.program_categories_new enable row level security;
alter table public.programs_new enable row level security;

drop policy if exists "Public can read program categories new" on public.program_categories_new;
create policy "Public can read program categories new"
  on public.program_categories_new for select using (true);

drop policy if exists "Admins can manage program categories new" on public.program_categories_new;
create policy "Admins can manage program categories new"
  on public.program_categories_new for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Public can read published programs new" on public.programs_new;
create policy "Public can read published programs new"
  on public.programs_new for select using (status = 'published');

drop policy if exists "Admins can manage programs new" on public.programs_new;
create policy "Admins can manage programs new"
  on public.programs_new for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

insert into public.program_categories_new (name, slug)
values
  ('Technology', 'technology'),
  ('Data Science & AI', 'data-science-ai'),
  ('Cloud & Security', 'cloud-security'),
  ('Hardware & Engineering', 'hardware-engineering'),
  ('Business & Management', 'business-management'),
  ('Design & Creativity', 'design-creativity'),
  ('Healthcare & Science', 'healthcare-science')
on conflict (slug) do update set name = excluded.name, updated_at = now();

insert into public.programs_new (title, slug, category, status)
values
  ('Web Development', 'web-development', 'Technology', 'draft'),
  ('Python Programming', 'python-programming', 'Technology', 'draft'),
  ('Java Programming', 'java-programming', 'Technology', 'draft'),
  ('C & C++ Programming', 'c-cpp-programming', 'Technology', 'draft'),
  ('Data Structures & Algorithms', 'data-structures-algorithms', 'Technology', 'draft'),
  ('MERN Stack', 'mern-stack', 'Technology', 'draft'),
  ('Android Development', 'android-development', 'Technology', 'draft'),
  ('VLSI', 'vlsi', 'Hardware & Engineering', 'draft'),
  ('Nanotechnology', 'nanotechnology', 'Hardware & Engineering', 'draft'),
  ('Embedded Systems', 'embedded-systems', 'Hardware & Engineering', 'draft'),
  ('Internet of Things', 'internet-of-things', 'Hardware & Engineering', 'draft'),
  ('Hybrid Electric Vehicles', 'hybrid-electric-vehicles', 'Hardware & Engineering', 'draft'),
  ('AutoCAD', 'autocad', 'Hardware & Engineering', 'draft'),
  ('Machine Learning', 'machine-learning', 'Data Science & AI', 'draft'),
  ('Artificial Intelligence', 'artificial-intelligence', 'Data Science & AI', 'draft'),
  ('Data Science', 'data-science', 'Data Science & AI', 'draft'),
  ('Cloud Computing', 'cloud-computing', 'Cloud & Security', 'draft'),
  ('Cyber Security', 'cyber-security', 'Cloud & Security', 'draft'),
  ('Business Analytics', 'business-analytics', 'Business & Management', 'draft'),
  ('Digital Marketing', 'digital-marketing', 'Business & Management', 'draft'),
  ('Finance', 'finance', 'Business & Management', 'draft'),
  ('Stock Trading', 'stock-trading', 'Business & Management', 'draft'),
  ('Human Resources', 'human-resources', 'Business & Management', 'draft'),
  ('Corporate Law', 'corporate-law', 'Business & Management', 'draft'),
  ('Operations & Supply Chain Management', 'operations-supply-chain-management', 'Business & Management', 'draft'),
  ('UI/UX Design', 'ui-ux-design', 'Design & Creativity', 'draft'),
  ('Psychology', 'psychology', 'Healthcare & Science', 'draft'),
  ('Medical Coding', 'medical-coding', 'Healthcare & Science', 'draft'),
  ('Clinical Training & Research', 'clinical-training-research', 'Healthcare & Science', 'draft')
on conflict (slug) do nothing;