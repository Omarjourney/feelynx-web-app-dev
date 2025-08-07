import { Router, Request, Response } from 'express';
import { authenticateToken } from './auth.js';
import { createClient } from '@supabase/supabase-js';

interface AuthRequest extends Request {
  userId?: string | number;
}

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

router.post('/threads', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { recipientId } = req.body as { recipientId?: string };
  if (!recipientId) {
    return res.status(400).json({ error: 'recipientId required' });
  }
  const { data, error } = await supabase
    .from('dm_threads')
    .insert({ user1_id: String(req.userId), user2_id: recipientId })
    .select()
    .single();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.get('/threads', authenticateToken, async (req: AuthRequest, res: Response) => {
  const uid = String(req.userId);
  const { data, error } = await supabase
    .from('dm_threads')
    .select('*')
    .or(`user1_id.eq.${uid},user2_id.eq.${uid}`)
    .order('created_at', { ascending: false });
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.get('/threads/:id/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('dm_messages')
    .select('*')
    .eq('thread_id', id)
    .order('created_at', { ascending: true });
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.post('/threads/:id/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { cipher_text, nonce, recipientId, burnAfterReading } = req.body as {
    cipher_text?: string;
    nonce?: string;
    recipientId?: string;
    burnAfterReading?: boolean;
  };
  if (!cipher_text || !nonce || !recipientId) {
    return res.status(400).json({ error: 'cipher_text, nonce and recipientId required' });
  }
  const { data, error } = await supabase
    .from('dm_messages')
    .insert({
      thread_id: id,
      sender_id: String(req.userId),
      recipient_id: recipientId,
      cipher_text,
      nonce,
      burn_after_reading: burnAfterReading ?? false
    })
    .select()
    .single();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

router.post('/messages/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('dm_messages')
    .select('burn_after_reading')
    .eq('id', id)
    .single();
  if (error || !data) {
    return res.status(404).json({ error: 'Message not found' });
  }
  if (data.burn_after_reading) {
    await supabase.from('dm_messages').delete().eq('id', id);
    return res.json({ burned: true });
  }
  await supabase
    .from('dm_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);
  res.json({ read: true });
});

export default router;
