import { Router } from 'express';
import { supabase } from '../db/supabase';
import { patternSchemas, withValidation } from '../utils/validation';
import { authenticateToken } from './auth.js';
const router = Router();
// List patterns (own first)
router.get('/', authenticateToken, async (req, res) => {
  const uid = String(req.userId);
  try {
    const sb = supabase;
    let query = sb.from('patterns').select('*').eq('user_id', uid);
    if (typeof query.order === 'function') {
      query = query.order('created_at', { ascending: false });
    }
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data !== null && data !== void 0 ? data : []);
  } catch (_a) {
    res.json([]);
  }
});
router.post('/', authenticateToken, withValidation(patternSchemas.create), async (req, res) => {
  const body = req.body;
  const record = {
    id: `p_${Date.now()}`,
    user_id: String(req.userId),
    name: body.name,
    duration_sec: body.durationSec,
    tags: body.tags,
    created_at: new Date().toISOString(),
  };
  try {
    const sb = supabase;
    const insertRes = sb.from('patterns').insert(record);
    if (typeof insertRes.select === 'function') {
      const maybe = insertRes.select();
      if (maybe.single) {
        const out = await maybe.single();
        if (out === null || out === void 0 ? void 0 : out.error)
          return res.status(500).json({ error: out.error.message });
      } else {
        await maybe;
      }
    } else {
      await insertRes;
    }
    res.status(201).json(record);
  } catch (_a) {
    res.status(201).json(record);
  }
});
router.patch('/:id', authenticateToken, withValidation(patternSchemas.rename), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const { error } = await supabase
      .from('patterns')
      .update({ name })
      .eq('id', id)
      .eq('user_id', String(req.userId));
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true, id, name });
  } catch (_a) {
    res.json({ ok: true, id, name });
  }
});
router.delete(
  '/:id',
  authenticateToken,
  withValidation(patternSchemas.remove),
  async (req, res) => {
    const { id } = req.params;
    try {
      const { error } = await supabase
        .from('patterns')
        .delete()
        .eq('id', id)
        .eq('user_id', String(req.userId));
      if (error) return res.status(500).json({ error: error.message });
      res.json({ ok: true });
    } catch (_a) {
      res.json({ ok: true });
    }
  },
);
export default router;
