-- Alter subscription_tiers to support perks, badge and visibility
ALTER TABLE public.subscription_tiers
  ADD COLUMN IF NOT EXISTS badge text,
  ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public',
  RENAME COLUMN benefits TO perks;

-- Create fan_subscriptions table
CREATE TABLE IF NOT EXISTS public.fan_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id uuid REFERENCES public.subscription_tiers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'active',
  renews_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tier_id, user_id)
);

ALTER TABLE public.fan_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fan subscriptions" ON public.fan_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own fan subscriptions" ON public.fan_subscriptions
  FOR ALL USING (user_id = auth.uid());
