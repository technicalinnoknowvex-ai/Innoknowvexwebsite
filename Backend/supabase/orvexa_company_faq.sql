create table if not exists public.company_faq (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  question text not null,
  answer text not null,
  keywords text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_faq_active_category_idx
  on public.company_faq (category)
  where is_active = true;

create index if not exists company_faq_keywords_idx
  on public.company_faq using gin (keywords);

alter table public.company_faq enable row level security;
grant select on public.company_faq to anon, authenticated;

drop policy if exists "Public can read active company FAQs" on public.company_faq;
create policy "Public can read active company FAQs"
  on public.company_faq
  for select
  to anon, authenticated
  using (is_active = true);

insert into public.company_faq (slug, category, question, answer, keywords)
values
  (
    'company-overview',
    'company',
    'What is Innoknowvex?',
    'Innoknowvex provides career-focused training and internship programs. Its stated approach combines practical learning, real-world projects, and guidance from experienced professionals.',
    array['company', 'about', 'innoknowvex', 'training', 'internship', 'career']
  ),
  (
    'learning-approach',
    'learning',
    'How does learning at Innoknowvex work?',
    'Innoknowvex describes its approach as learn by doing, using practical exercises and projects with expert guidance. The exact format depends on the selected program.',
    array['learning', 'teaching', 'approach', 'hands-on', 'practical', 'projects', 'mentor', 'mentorship']
  ),
  (
    'training-benefits',
    'learning',
    'What are the benefits of Innoknowvex training?',
    'The website describes practical, career-focused learning with projects and expert guidance. Listed support includes live classes, interview training, and help with resumes and LinkedIn profiles. Do not promise employment or a specific outcome.',
    array['benefits', 'why', 'choose', 'career', 'live classes', 'interview', 'resume', 'linkedin', 'projects']
  ),
  (
    'career-support',
    'career',
    'What career support is available?',
    'The website describes job assistance, interview preparation, and resume and LinkedIn profile guidance. Describe these as support services, not a guarantee of placement or employment.',
    array['career', 'job', 'placement', 'assistance', 'interview', 'resume', 'linkedin', 'support']
  ),
  (
    'internship-availability',
    'programs',
    'Are internships available?',
    'Innoknowvex offers internship programs, but availability is specific to each course. Check the selected course record and do not claim that every course includes an internship.',
    array['internship', 'internships', 'course', 'availability', 'training']
  ),
  (
    'offline-programs',
    'programs',
    'Does Innoknowvex offer offline training?',
    'The website lists offline Artificial Intelligence, AI and Machine Learning, Data Science, and Full Stack Web Development programs. Confirm current availability and location with the company before promising a schedule.',
    array['offline', 'in person', 'classroom', 'location', 'artificial intelligence', 'machine learning', 'data science', 'full stack']
  ),
  (
    'course-duration',
    'programs',
    'How long does a course take?',
    'A verified course duration is not included in the assistant FAQ reference. Do not estimate it; use an approved course duration if available or ask the learner which course they mean and direct them to the company for the current schedule.',
    array['duration', 'length', 'how long', 'weeks', 'months', 'schedule', 'course']
  ),
  (
    'course-curriculum',
    'programs',
    'Where does course curriculum information come from?',
    'Use the curriculum attached to the matched course in the program catalog. Explain the listed modules and topics in your own words, and do not add unlisted modules.',
    array['curriculum', 'syllabus', 'topics', 'modules', 'course content']
  ),
  (
    'course-pricing',
    'payments',
    'Where does course pricing information come from?',
    'Use the current and actual plan prices in the program pricing table, including its currency. Match prices to the correct course; if the course or price row is unclear, ask the learner to clarify instead of guessing.',
    array['price', 'pricing', 'fee', 'fees', 'cost', 'tuition', 'payment', 'discount', 'course']
  )
on conflict (slug) do update
set
  category = excluded.category,
  question = excluded.question,
  answer = excluded.answer,
  keywords = excluded.keywords,
  updated_at = now();
