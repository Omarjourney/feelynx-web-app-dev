-- Enable Row Level Security on all tables that don't have it
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Creators table policies
CREATE POLICY "Users can view all creators" ON public.creators
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own creator profile" ON public.creators
FOR ALL USING (user_id = auth.uid());

-- Groups table policies
CREATE POLICY "Users can view public groups or groups they're members of" ON public.groups
FOR SELECT USING (
  visibility = 'public' OR 
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid())
);

CREATE POLICY "Users can create groups" ON public.groups
FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Group owners can update their groups" ON public.groups
FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Group owners can delete their groups" ON public.groups
FOR DELETE USING (owner_id = auth.uid());

-- Group members table policies
CREATE POLICY "Users can view members of groups they belong to" ON public.group_members
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
);

CREATE POLICY "Users can join groups" ON public.group_members
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave groups or group owners can remove members" ON public.group_members
FOR DELETE USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.groups WHERE id = group_members.group_id AND owner_id = auth.uid())
);

-- Messages table policies
CREATE POLICY "Users can view messages in groups they're members of" ON public.messages
FOR SELECT USING (
  sender_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = messages.group_id AND user_id = auth.uid())
);

CREATE POLICY "Users can send messages to groups they're members of" ON public.messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = messages.group_id AND user_id = auth.uid())
);

-- Content posts table policies
CREATE POLICY "Users can view free content or content they've purchased" ON public.content_posts
FOR SELECT USING (
  price = 0 OR
  creator_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.purchases WHERE content_id = content_posts.id AND user_id = auth.uid())
);

CREATE POLICY "Creators can manage their own content" ON public.content_posts
FOR ALL USING (creator_id = auth.uid());

-- Purchases table policies
CREATE POLICY "Users can view their own purchases" ON public.purchases
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can make purchases" ON public.purchases
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Subscriptions table policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own subscriptions" ON public.subscriptions
FOR ALL USING (user_id = auth.uid());

-- Subscription tiers table policies
CREATE POLICY "Anyone can view subscription tiers" ON public.subscription_tiers
FOR SELECT USING (true);

CREATE POLICY "Creators can manage their own subscription tiers" ON public.subscription_tiers
FOR ALL USING (creator_id = auth.uid());

-- Livestreams table policies
CREATE POLICY "Anyone can view live streams" ON public.livestreams
FOR SELECT USING (true);

CREATE POLICY "Creators can manage their own livestreams" ON public.livestreams
FOR ALL USING (creator_id = auth.uid());

-- Transactions table policies
CREATE POLICY "Users can view their own transactions" ON public."Transactions"
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transactions" ON public."Transactions"
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Wallets table policies
CREATE POLICY "Users can view their own wallet" ON public.wallets
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own wallet" ON public.wallets
FOR ALL USING (user_id = auth.uid());