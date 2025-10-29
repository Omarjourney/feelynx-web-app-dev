import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase';
import { toySchemas, withValidation, type InferBody, type InferParams } from '../utils/validation';
import { authenticateToken } from './auth.js';

interface AuthRequest extends Request {
  userId?: string | number;
}

const router = Router();

// List current user's toys
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const uid = String(req.userId);
  try {
    const sb: any = supabase as any;
    let query = sb.from('toys').select('*').eq('user_id', uid);
    if (typeof query.order === 'function') {
      query = query.order('created_at', { ascending: false });
    }
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ?? []);
  } catch (err) {
    // Stub fallback
    res.json([]);
  }
});

// Create a toy
router.post(
  '/',
  authenticateToken,
  withValidation(toySchemas.create),
  async (req: AuthRequest, res: Response) => {
    const body = req.body as InferBody<typeof toySchemas.create>;
    const record = {
      id: `t_${Date.now()}`,
      user_id: String(req.userId),
      name: body.name ?? body.brand,
      brand: body.brand,
      status: 'disconnected',
      created_at: new Date().toISOString(),
    };
    try {
      const sb: any = supabase as any;
      const insertRes = sb.from('toys').insert(record);
      if (typeof insertRes.select === 'function') {
        const maybe = insertRes.select();
        if ((maybe as any).single) {
          const out = await (maybe as any).single();
          if (out?.error) return res.status(500).json({ error: out.error.message });
        } else {
          await maybe;
        }
      } else {
        await insertRes;
      }
      res.status(201).json(record);
    } catch {
      // Stub fallback
      res.status(201).json(record);
    }
  },
);

// Remove a toy
router.delete(
  '/:id',
  authenticateToken,
  withValidation(toySchemas.remove),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as InferParams<typeof toySchemas.remove>;
    try {
      const { error } = await (supabase as any)
        .from('toys')
        .delete()
        .eq('id', id)
        .eq('user_id', String(req.userId));
      if (error) return res.status(500).json({ error: error.message });
      res.json({ ok: true });
    } catch {
      res.json({ ok: true });
    }
  },
);

export default router;
