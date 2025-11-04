import { Router } from 'express';

const router = Router();

let sessionEarnings = 128.5;
let tips = 40;
let duration = 3600;

router.get('/', (_req, res) => {
  res.json({
    sessionEarnings,
    tips,
    duration,
    updatedAt: new Date().toISOString(),
  });
});

router.post('/simulate', (req, res) => {
  const { earnings = 0, tips: newTips = 0, duration: newDuration = 0 } = req.body ?? {};
  if ([earnings, newTips, newDuration].some((value) => !Number.isFinite(Number(value)))) {
    res.status(400).json({ error: 'Values must be numeric' });
    return;
  }
  sessionEarnings = Number(earnings);
  tips = Number(newTips);
  duration = Number(newDuration);
  res.json({ sessionEarnings, tips, duration, updatedAt: new Date().toISOString() });
});

export default router;
