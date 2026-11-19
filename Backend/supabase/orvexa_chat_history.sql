create table if not exists public.orvexa_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.orvexa_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  user_id uuid not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (length(btrim(content)) > 0),
  created_at timestamptz not null default now(),
  constraint orvexa_messages_conversation_owner_fk
    foreign key (conversation_id, user_id)
    references public.orvexa_conversations (id, user_id)
    on delete cascade
);

create index if not exists orvexa_conversations_user_updated_idx
  on public.orvexa_conversations (user_id, updated_at desc);

create index if not exists orvexa_messages_conversation_created_idx
  on public.orvexa_messages (conversation_id, created_at, id);

alter table public.orvexa_conversations enable row level security;
alter table public.orvexa_messages enable row level security;

drop policy if exists "Users can read own Orvexa conversations"
  on public.orvexa_conversations;
create policy "Users can read own Orvexa conversations"
  on public.orvexa_conversations
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can create own Orvexa conversations"
  on public.orvexa_conversations;
create policy "Users can create own Orvexa conversations"
  on public.orvexa_conversations
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own Orvexa conversations"
  on public.orvexa_conversations;
create policy "Users can update own Orvexa conversations"
  on public.orvexa_conversations
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete own Orvexa conversations"
  on public.orvexa_conversations;
create policy "Users can delete own Orvexa conversations"
  on public.orvexa_conversations
  for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can read own Orvexa messages"
  on public.orvexa_messages;
create policy "Users can read own Orvexa messages"
  on public.orvexa_messages
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can add own Orvexa messages"
  on public.orvexa_messages;
create policy "Users can add own Orvexa messages"
  on public.orvexa_messages
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and role = 'user'
  );

grant select, insert, update, delete
  on public.orvexa_conversations to authenticated;
grant select, insert
  on public.orvexa_messages to authenticated;
grant all
  on public.orvexa_conversations, public.orvexa_messages to service_role;

create or replace function public.touch_orvexa_conversation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.orvexa_conversations
  set updated_at = now()
  where id = new.conversation_id
    and user_id = new.user_id;

  return new;
end;
$$;

drop trigger if exists touch_orvexa_conversation_on_message
  on public.orvexa_messages;
create trigger touch_orvexa_conversation_on_message
  after insert on public.orvexa_messages
  for each row
  execute function public.touch_orvexa_conversation();
