-- Direct message threads
CREATE TABLE public.dm_threads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id uuid NOT NULL REFERENCES auth.users (id),
  user2_id uuid NOT NULL REFERENCES auth.users (id),
  created_at timestamptz DEFAULT now()
);

-- Direct messages
CREATE TABLE public.dm_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id uuid NOT NULL REFERENCES public.dm_threads (id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users (id),
  recipient_id uuid NOT NULL REFERENCES auth.users (id),
  nonce text NOT NULL,
  cipher_text text NOT NULL,
  read_at timestamptz,
  burn_after_reading boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Optional key pairs for end-to-end encryption
CREATE TABLE public.dm_key_pairs (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id),
  public_key text NOT NULL,
  private_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dm_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_key_pairs ENABLE ROW LEVEL SECURITY;

-- Policies for threads
CREATE POLICY "Users can view their threads" ON public.dm_threads
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create threads" ON public.dm_threads
  FOR INSERT WITH CHECK (auth.uid() = user1_id);

-- Policies for messages
CREATE POLICY "Participants can view messages" ON public.dm_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Participants can send messages" ON public.dm_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND EXISTS (
      SELECT 1 FROM public.dm_threads t
      WHERE t.id = dm_messages.thread_id
        AND (t.user1_id = auth.uid() OR t.user2_id = auth.uid())
    )
  );

CREATE POLICY "Recipients can mark messages read" ON public.dm_messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Policies for key pairs
CREATE POLICY "Users manage own key pairs" ON public.dm_key_pairs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
