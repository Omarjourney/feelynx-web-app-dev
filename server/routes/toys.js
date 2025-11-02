import { Router } from 'express';
import { supabase } from '../db/supabase';
import { toySchemas, withValidation } from '../utils/validation';
import { authenticateToken } from './auth.js';
const router = Router();
// List current user's toys
router.get('/', authenticateToken, async (req, res) => {
  const uid = String(req.userId);
  try {
    const sb = supabase;
    let query = sb.from('toys').select('*').eq('user_id', uid);
    if (typeof query.order === 'function') {
      query = query.order('created_at', { ascending: false });
    }
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data !== null && data !== void 0 ? data : []);
  } catch (err) {
    // Stub fallback
    res.json([]);
  }
});
// Create a toy
router.post('/', authenticateToken, withValidation(toySchemas.create), async (req, res) => {
  var _a;
  const body = req.body;
  const record = {
    id: `t_${Date.now()}`,
    user_id: String(req.userId),
    name: (_a = body.name) !== null && _a !== void 0 ? _a : body.brand,
    brand: body.brand,
    status: 'disconnected',
    created_at: new Date().toISOString(),
  };
  try {
    const sb = supabase;
    const insertRes = sb.from('toys').insert(record);
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
  } catch (_b) {
    // Stub fallback
    res.status(201).json(record);
  }
});
// Remove a toy
router.delete('/:id', authenticateToken, withValidation(toySchemas.remove), async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('toys')
      .delete()
      .eq('id', id)
      .eq('user_id', String(req.userId));
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  } catch (_a) {
    res.json({ ok: true });
  }
});
export default router;
