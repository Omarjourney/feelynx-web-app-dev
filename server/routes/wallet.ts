import { Router } from 'express';

const router = Router();

let coinsBalance = 3250;

router.get('/', (_req, res) => {
  res.json({ coins: coinsBalance, updatedAt: new Date().toISOString() });
});

router.post('/add', (req, res) => {
  const amount = Number(req.body?.amount ?? 0);
  if (!Number.isFinite(amount)) {
    res.status(400).json({ error: 'Amount must be numeric' });
    return;
  }
  coinsBalance = Math.max(0, coinsBalance + amount);
  res.json({ coins: coinsBalance, updatedAt: new Date().toISOString() });
});

export default router;
