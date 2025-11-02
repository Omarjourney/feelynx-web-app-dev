import { Router } from 'express';
import crypto from 'crypto';
import { publishCommand, publishEnd } from '../wsControl';
const router = Router();
const SESSIONS = new Map();
function randId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}
// Create a consented control session (performer-side action)
router.post('/sessions', (req, res) => {
  const { ownerId = 'owner_demo', maxIntensity = 12, durationSec = 300 } = req.body || {};
  const id = randId('sess');
  const token = randId('ctok');
  const sess = {
    id,
    token,
    ownerId,
    maxIntensity: Math.max(0, Math.min(20, maxIntensity)),
    durationSec: Math.max(60, Math.min(3600, durationSec)),
    createdAt: Date.now(),
    revoked: false,
  };
  SESSIONS.set(id, sess);
  res.status(201).json({
    id: sess.id,
    token: sess.token,
    maxIntensity: sess.maxIntensity,
    durationSec: sess.durationSec,
    createdAt: sess.createdAt,
  });
});
// Revoke session early
router.post('/sessions/:id/revoke', (req, res) => {
  const { id } = req.params;
  const sess = SESSIONS.get(id);
  if (!sess) return res.status(404).json({ error: 'not_found' });
  sess.revoked = true;
  SESSIONS.set(id, sess);
  publishEnd(id);
  res.json({ ok: true });
});
// Validate a control command (controller-side action)
router.post('/sessions/:id/command', (req, res) => {
  const { id } = req.params;
  const { intensity = 0 } = req.body;
  const auth = req.header('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : undefined;
  const sess = SESSIONS.get(id);
  if (!sess || sess.revoked) return res.status(403).json({ error: 'revoked_or_missing' });
  if (!token || token !== sess.token) return res.status(401).json({ error: 'unauthorized' });
  const elapsed = (Date.now() - sess.createdAt) / 1000;
  if (elapsed > sess.durationSec) return res.status(403).json({ error: 'expired' });
  const bounded = Math.max(0, Math.min(sess.maxIntensity, Number(intensity) || 0));
  publishCommand(id, bounded);
  return res.json({ ok: true, intensity: bounded });
});
export default router;
