import { Router, Request, Response } from 'express';
import { authenticateToken } from './auth.js';
import { supabase } from '../db/supabase';
import {
  dmSchemas,
  type DmMessageBody,
  type InferBody,
  type InferParams,
  withValidation,
} from '../utils/validation';

interface AuthRequest extends Request {
  userId?: string | number;
}

const router = Router();

router.post(
  '/threads',
  authenticateToken,
  withValidation(dmSchemas.createThread),
  async (req: AuthRequest, res: Response) => {
    const { recipientId } = req.body as InferBody<typeof dmSchemas.createThread>;
    const { data, error } = await supabase
      .from('dm_threads')
      .insert({ user1_id: String(req.userId), user2_id: recipientId })
      .select()
      .single();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  },
);

router.get(
  '/threads',
  authenticateToken,
  withValidation(dmSchemas.listThreads),
  async (req: AuthRequest, res: Response) => {
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
  },
);

router.get(
  '/threads/:id/messages',
  authenticateToken,
  withValidation(dmSchemas.threadMessages),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as InferParams<typeof dmSchemas.threadMessages>;
    const { data, error } = await supabase
      .from('dm_messages')
      .select('*')
      .eq('thread_id', id)
      .order('created_at', { ascending: true });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  },
);

router.post(
  '/threads/:id/messages',
  authenticateToken,
  withValidation(dmSchemas.sendMessage),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as InferParams<typeof dmSchemas.sendMessage>;
    const { cipher_text, nonce, recipientId, burnAfterReading } = req.body as DmMessageBody;
    const { data, error } = await supabase
      .from('dm_messages')
      .insert({
        thread_id: id,
        sender_id: String(req.userId),
        recipient_id: recipientId,
        cipher_text,
        nonce,
        burn_after_reading: burnAfterReading ?? false,
      })
      .select()
      .single();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  },
);

router.post(
  '/messages/:id/read',
  authenticateToken,
  withValidation(dmSchemas.readMessage),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as InferParams<typeof dmSchemas.readMessage>;
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
    await supabase.from('dm_messages').update({ read_at: new Date().toISOString() }).eq('id', id);
    res.json({ read: true });
  },
);

export default router;
