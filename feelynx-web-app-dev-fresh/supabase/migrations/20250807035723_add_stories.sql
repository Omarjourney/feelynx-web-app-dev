create table public.stories (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  media_url text not null,
  expires_at timestamptz not null,
  visibility text not null check (visibility in ('public','subscribers','tier')),
  tier_id uuid references public.subscription_tiers(id)
);

alter table public.stories enable row level security;

-- Create storage bucket for story media
select storage.create_bucket('stories', public => false);

-- Policies
create policy "Stories visibility" on public.stories
for select using (
  visibility = 'public'
  or creator_id = auth.uid()
  or visibility = 'subscribers' and exists (
    select 1 from public.subscriptions s
    where s.creator_id = stories.creator_id and s.user_id = auth.uid()
  )
  or visibility = 'tier' and exists (
    select 1 from public.subscriptions s
    where s.creator_id = stories.creator_id and s.user_id = auth.uid() and s.tier_id = stories.tier_id
  )
);

create policy "Creators manage own stories" on public.stories
for all using (creator_id = auth.uid()) with check (creator_id = auth.uid());
