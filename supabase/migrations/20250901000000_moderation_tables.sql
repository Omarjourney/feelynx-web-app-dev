-- Moderation tables
create table if not exists public.reports (
  id bigserial primary key,
  reported_id bigint not null,
  type text not null,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.moderation_actions (
  id bigserial primary key,
  report_id bigint references public.reports(id),
  action text not null,
  moderator_id bigint,
  created_at timestamptz default now()
);

create table if not exists public.banned_users (
  id bigserial primary key,
  user_id bigint not null,
  reason text,
  banned_at timestamptz default now(),
  expires_at timestamptz
);

alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.banned_users enable row level security;

create policy "Anyone can submit reports" on public.reports
for insert
with check (true);

create policy "Only moderators manage reports" on public.reports
for select using (auth.jwt() ->> 'role' = 'moderator')
  with check (auth.jwt() ->> 'role' = 'moderator');

create policy "Only moderators manage moderation_actions" on public.moderation_actions
for all using (auth.jwt() ->> 'role' = 'moderator')
  with check (auth.jwt() ->> 'role' = 'moderator');

create policy "Only moderators manage banned_users" on public.banned_users
for all using (auth.jwt() ->> 'role' = 'moderator')
  with check (auth.jwt() ->> 'role' = 'moderator');
