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
    'Innoknowvex is an education and technology company focused on making industry-ready skills and real-world opportunities more accessible. It connects students, professionals, and institutions through practical learning, industry exposure, career-focused programs, and technology. Innoknowvex works as a growth partner for individuals and institutions, helping build a skilled, future-ready workforce.',
    array['company', 'about', 'about us', 'who we are', 'what we do', 'innoknowvex', 'education', 'technology', 'training', 'internship', 'career', 'organization', 'organisation', 'business']
  ),
  (
    'company-contact',
    'company',
    'How can I contact Innoknowvex?',
    'You can email Innoknowvex at support@innoknowvex.in or call +91 9535788085. The office is at Aratt Girija Towers, Survey 157/1, 2nd Floor, Manipal County Club Road, opposite Lake View County Apartment, Singasandra, Bengaluru, Karnataka - 560068. It is above Star Market.',
    array['contact', 'contact details', 'contact information', 'get in touch', 'email', 'phone', 'telephone', 'call', 'address', 'office', 'location', 'support', 'company']
  ),
  (
    'company-story',
    'company',
    'What is the story behind Innoknowvex?',
    'Innoknowvex was founded on the belief that the right skills and opportunities can transform lives. What began as an education and internship platform has grown into a technology-driven ecosystem connecting students, professionals, and institutions with real-world learning, industry exposure, and career opportunities.',
    array['company story', 'history', 'founded', 'origin', 'started', 'journey', 'about', 'innoknowvex']
  ),
  (
    'company-mission',
    'company',
    'What is Innoknowvex''s mission?',
    'Innoknowvex''s mission is to make industry-ready education, real-world experience, and career opportunities accessible to everyone.',
    array['mission', 'purpose', 'goal', 'company', 'about', 'innoknowvex']
  ),
  (
    'company-vision',
    'company',
    'What is Innoknowvex''s vision?',
    'Innoknowvex''s vision is to be a global leader in skill development and career technology, empowering millions to achieve their dreams.',
    array['vision', 'future', 'ambition', 'company', 'about', 'innoknowvex']
  ),
  (
    'company-values',
    'company',
    'What values guide Innoknowvex?',
    'Innoknowvex values putting learners first, innovation, integrity, opportunity for all, and making a real impact.',
    array['values', 'principles', 'beliefs', 'company', 'about', 'innoknowvex']
  ),
  (
    'learning-approach',
    'learning',
    'How does learning at Innoknowvex work?',
    'Learning at Innoknowvex is based on learning by doing, with practical exercises, projects, and expert guidance. The exact format depends on the program.',
    array['learning', 'teaching', 'approach', 'hands-on', 'practical', 'projects', 'mentor', 'mentorship']
  ),
  (
    'training-benefits',
    'learning',
    'What are the benefits of Innoknowvex training?',
    'Innoknowvex offers practical, career-focused learning with projects and expert guidance. Learners can also receive live classes, interview training, and help with resumes and LinkedIn profiles. These services support career preparation but do not guarantee employment or a specific outcome.',
    array['benefits', 'why', 'choose', 'career', 'live classes', 'interview', 'resume', 'linkedin', 'projects']
  ),
  (
    'career-support',
    'career',
    'What career support is available?',
    'Innoknowvex provides resume-building training and LinkedIn profile guidance as general career-readiness support across its training sessions; this support is not exclusive to the Clinical Training & Research program or another single course. Learners can also get interview preparation and job assistance. These services do not guarantee placement, employment, or a specific outcome.',
    array['career', 'job', 'placement', 'assistance', 'interview', 'resume', 'resume building', 'cv', 'linkedin', 'profile building', 'career support', 'support', 'all training sessions']
  ),
  (
    'internship-availability',
    'programs',
    'Are internships available?',
    'Innoknowvex offers internship programs, but availability varies by course. Ask which program the learner is interested in before confirming internship availability.',
    array['internship', 'internships', 'course', 'availability', 'training']
  ),
  (
    'offline-programs',
    'programs',
    'Does Innoknowvex offer offline training?',
    'Offline programs include Artificial Intelligence, AI and Machine Learning, Data Science, and Full Stack Web Development. Availability and locations can change, so confirm the current schedule before making a promise.',
    array['offline', 'in person', 'classroom', 'location', 'artificial intelligence', 'machine learning', 'data science', 'full stack']
  ),
  (
    'course-duration',
    'programs',
    'How long does a course take?',
    'Course duration depends on the program. Ask which course the learner means, then share its training and internship durations when available. If the timing is not confirmed, offer to help them check the current schedule.',
    array['duration', 'length', 'how long', 'weeks', 'months', 'schedule', 'course']
  ),
  (
    'course-curriculum',
    'programs',
    'Where does course curriculum information come from?',
    'Course content varies by program. Explain the relevant modules and topics in plain language, and do not add details that have not been confirmed.',
    array['curriculum', 'syllabus', 'topics', 'modules', 'course content']
  ),
  (
    'course-pricing',
    'payments',
    'Where does course pricing information come from?',
    'Prices depend on the course and plan. Share the current price and currency for the course the learner asks about. If the course or plan is unclear, ask a follow-up instead of guessing.',
    array['price', 'pricing', 'fee', 'fees', 'cost', 'tuition', 'payment', 'discount', 'course']
  )
on conflict (slug) do update
set
  category = excluded.category,
  question = excluded.question,
  answer = excluded.answer,
  keywords = excluded.keywords,
  updated_at = now();
