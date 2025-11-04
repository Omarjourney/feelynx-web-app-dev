import { Router, Request, Response } from 'express';
import { supabase } from '../db/supabase';
import {
  patternSchemas,
  withValidation,
  type InferBody,
  type InferParams,
} from '../utils/validation';
import { authenticateToken } from './auth.js';

interface AuthRequest extends Request {
  userId?: string | number;
}

const router = Router();

// List patterns (own first)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const uid = String(req.userId);
  try {
    const sb: any = supabase as any;
    let query = sb.from('patterns').select('*').eq('user_id', uid);
    if (typeof query.order === 'function') {
      query = query.order('created_at', { ascending: false });
    }
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ?? []);
  } catch {
    res.json([]);
  }
});

router.post(
  '/',
  authenticateToken,
  withValidation(patternSchemas.create),
  async (req: AuthRequest, res: Response) => {
    const body = req.body as InferBody<typeof patternSchemas.create>;
    const record = {
      id: `p_${Date.now()}`,
      user_id: String(req.userId),
      name: body.name,
      duration_sec: body.durationSec,
      tags: body.tags,
      created_at: new Date().toISOString(),
    };
    try {
      const sb: any = supabase as any;
      const insertRes = sb.from('patterns').insert(record);
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
      res.status(201).json(record);
    }
  },
);

router.patch(
  '/:id',
  authenticateToken,
  withValidation(patternSchemas.rename),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as InferParams<typeof patternSchemas.rename>;
    const { name } = req.body as InferBody<typeof patternSchemas.rename>;
    try {
      const { error } = await (supabase as any)
        .from('patterns')
        .update({ name })
        .eq('id', id)
        .eq('user_id', String(req.userId));
      if (error) return res.status(500).json({ error: error.message });
      res.json({ ok: true, id, name });
    } catch {
      res.json({ ok: true, id, name });
    }
  },
);

router.delete(
  '/:id',
  authenticateToken,
  withValidation(patternSchemas.remove),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params as InferParams<typeof patternSchemas.remove>;
    try {
      const { error } = await (supabase as any)
        .from('patterns')
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
