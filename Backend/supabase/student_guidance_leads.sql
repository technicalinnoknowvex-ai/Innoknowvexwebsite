create table if not exists public.student_guidance_leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null check (char_length(email) <= 254),
  phone text not null check (char_length(phone) between 10 and 30),
  training_interest text not null check (
    training_interest in (
      'AI & Data Science',
      'Web Development',
      'Cybersecurity',
      'Digital Marketing',
      'Business & Finance',
      'Other'
    )
  ),
  preferred_language text not null check (
    preferred_language in ('English', 'Hindi', 'Telugu', 'Other')
  ),
  contact_consent boolean not null default false check (contact_consent),
  source_page text not null default '/',
  created_at timestamptz not null default now()
);

alter table public.student_guidance_leads enable row level security;

drop policy if exists "Public can submit guidance leads"
  on public.student_guidance_leads;

create policy "Public can submit guidance leads"
  on public.student_guidance_leads
  for insert
  to anon, authenticated
  with check (contact_consent = true);

revoke all on table public.student_guidance_leads from anon, authenticated;
grant insert on table public.student_guidance_leads to anon, authenticated;
