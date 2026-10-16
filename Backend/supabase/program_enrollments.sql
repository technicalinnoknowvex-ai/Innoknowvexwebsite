create table if not exists public.program_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_name text not null,
  plan_key text not null check (
    plan_key in ('selfLearning', 'mentorPaced', 'professional', 'offline_all_inclusive')
  ),
  full_name text not null,
  email text not null,
  phone text not null,
  coupon_code text,
  idempotency_key uuid,
  currency text not null default 'INR',
  amount_paise integer not null check (amount_paise > 0),
  razorpay_order_id text not null unique,
  razorpay_payment_id text unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.program_enrollments
  add column if not exists idempotency_key uuid;

create unique index if not exists program_enrollments_user_idempotency_idx
  on public.program_enrollments (user_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists program_enrollments_user_created_idx
  on public.program_enrollments (user_id, created_at desc);

alter table public.program_enrollments enable row level security;

drop policy if exists "Users can read their program enrollments" on public.program_enrollments;
create policy "Users can read their program enrollments"
  on public.program_enrollments
  for select
  to authenticated
  using (auth.uid() = user_id);

revoke all on public.program_enrollments from anon, authenticated;
grant select on public.program_enrollments to authenticated;
