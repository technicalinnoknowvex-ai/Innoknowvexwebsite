create table if not exists public.college_partnership_inquiries (
  id uuid primary key default gen_random_uuid(),
  college_name text not null check (char_length(college_name) between 2 and 150),
  state text not null check (char_length(state) between 1 and 100),
  city text not null check (char_length(city) between 1 and 100),
  official_email text not null check (
    char_length(official_email) <= 254
    and official_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  contact_name text not null check (char_length(contact_name) between 2 and 100),
  phone text not null check (char_length(phone) between 10 and 30),
  partnership_interest text not null check (
    partnership_interest in (
      'Student training programs',
      'Internships and projects',
      'Placement and career support',
      'Institutional collaboration',
      'Other'
    )
  ),
  message text check (message is null or char_length(message) <= 1000),
  contact_consent boolean not null default false check (contact_consent),
  source_page text not null default '/About/About',
  created_at timestamptz not null default now()
);

alter table public.college_partnership_inquiries enable row level security;

drop policy if exists "Public can submit college partnership inquiries"
  on public.college_partnership_inquiries;

create policy "Public can submit college partnership inquiries"
  on public.college_partnership_inquiries
  for insert
  to anon, authenticated
  with check (contact_consent = true);

revoke all on table public.college_partnership_inquiries from anon, authenticated;
grant insert on table public.college_partnership_inquiries to anon, authenticated;
