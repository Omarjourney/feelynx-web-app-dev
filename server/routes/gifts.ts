import { Router } from 'express';

const router = Router();

// Placeholder gift catalogue
const gifts = [
  { id: 1, name: 'Heart', cost: 10 },
  { id: 2, name: 'Star', cost: 25 }
];

// In-memory token balances and transactions
const balances: Record<string, number> = {};
const transactions: Array<{ from: string; to: string; giftId: number; createdAt: Date }> = [];

router.get('/catalog', (req, res) => {
  res.json(gifts);
});

router.post('/balance/:userId/purchase', (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body as { amount: number };
  balances[userId] = (balances[userId] || 0) + amount;
  res.json({ balance: balances[userId] });
});

router.post('/send', (req, res) => {
  const { from, to, giftId } = req.body as { from: string; to: string; giftId: number };
  const gift = gifts.find((g) => g.id === giftId);
  if (!gift) return res.status(400).json({ error: 'Invalid gift' });
  balances[from] = (balances[from] || 0) - gift.cost;
  transactions.push({ from, to, giftId, createdAt: new Date() });
  res.json({ success: true, balance: balances[from] });
});

router.get('/leaderboard/:creatorId', (req, res) => {
  const { creatorId } = req.params;
  const leaderboard = transactions
    .filter((t) => t.to === creatorId)
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.from] = (acc[t.from] || 0) + (gifts.find((g) => g.id === t.giftId)?.cost || 0);
      return acc;
    }, {});
  const sorted = Object.entries(leaderboard)
    .sort((a, b) => b[1] - a[1])
    .map(([user, total]) => ({ user, total }));
  res.json(sorted);
});

export default router;
