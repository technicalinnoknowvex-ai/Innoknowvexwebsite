create table if not exists public.career_jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 150),
  department text not null check (char_length(department) between 2 and 100),
  location text not null check (char_length(location) between 2 and 150),
  employment_type text not null check (
    employment_type in ('Full-time', 'Part-time', 'Internship', 'Contract')
  ),
  description text not null check (char_length(description) between 10 and 10000),
  requirements text not null check (char_length(requirements) between 2 and 10000),
  application_deadline date,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists career_jobs_public_listing_idx
  on public.career_jobs (created_at desc)
  where status = 'published';

alter table public.career_jobs enable row level security;

drop policy if exists "Public can view open published jobs" on public.career_jobs;
create policy "Public can view open published jobs"
  on public.career_jobs
  for select
  to anon, authenticated
  using (
    status = 'published'
    and (application_deadline is null or application_deadline >= current_date)
  );

drop policy if exists "Admins can manage career jobs" on public.career_jobs;
create policy "Admins can manage career jobs"
  on public.career_jobs
  for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.career_jobs(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null check (
    char_length(email) <= 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  phone text not null check (char_length(phone) between 10 and 30),
  resume_url text check (resume_url is null or char_length(resume_url) <= 2048),
  linkedin_url text check (linkedin_url is null or char_length(linkedin_url) <= 2048),
  message text check (message is null or char_length(message) <= 2000),
  contact_consent boolean not null default false check (contact_consent),
  created_at timestamptz not null default now()
);

create index if not exists career_applications_job_created_idx
  on public.career_applications (job_id, created_at desc);

alter table public.career_applications enable row level security;

drop policy if exists "Applicants can submit applications for open jobs"
  on public.career_applications;
create policy "Applicants can submit applications for open jobs"
  on public.career_applications
  for insert
  to anon, authenticated
  with check (
    contact_consent = true
    and exists (
      select 1
      from public.career_jobs
      where career_jobs.id = career_applications.job_id
        and career_jobs.status = 'published'
        and (
          career_jobs.application_deadline is null
          or career_jobs.application_deadline >= current_date
        )
    )
  );

drop policy if exists "Admins can view career applications" on public.career_applications;
create policy "Admins can view career applications"
  on public.career_applications
  for select
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

revoke all on table public.career_jobs from anon, authenticated;
grant select on table public.career_jobs to anon, authenticated;
grant insert, update, delete on table public.career_jobs to authenticated;

revoke all on table public.career_applications from anon, authenticated;
grant insert on table public.career_applications to anon, authenticated;
grant select on table public.career_applications to authenticated;
