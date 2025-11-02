import { Router } from 'express';
import {
  giftSchemas,
  type GiftSendBody,
  type InferBody,
  type InferParams,
  withValidation,
} from '../utils/validation';

const router = Router();

// Placeholder gift catalogue
const gifts = [
  { id: 1, name: 'Heart', cost: 10 },
  { id: 2, name: 'Star', cost: 25 },
];

// In-memory token balances and transactions
const balances: Record<string, number> = {};
const transactions: Array<{ from: string; to: string; giftId: number; createdAt: Date }> = [];

router.get('/catalog', withValidation(giftSchemas.catalog), (_req, res) => {
  res.json(gifts);
});

router.post('/balance/:userId/purchase', withValidation(giftSchemas.purchase), (req, res) => {
  const { userId } = req.params as InferParams<typeof giftSchemas.purchase>;
  const { amount } = req.body as InferBody<typeof giftSchemas.purchase>;
  balances[userId] = (balances[userId] || 0) + amount;
  res.json({ balance: balances[userId] });
});

router.post('/send', withValidation(giftSchemas.send), (req, res) => {
  const { from, to, giftId } = req.body as GiftSendBody;
  const gift = gifts.find((g) => g.id === giftId);
  if (!gift) return res.status(400).json({ error: 'Invalid gift' });
  const currentBalance = balances[from] || 0;
  if (currentBalance < gift.cost) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  balances[from] = currentBalance - gift.cost;
  transactions.push({ from, to, giftId, createdAt: new Date() });
  res.json({ success: true, balance: balances[from] });
});

router.get('/leaderboard/:creatorId', withValidation(giftSchemas.leaderboard), (req, res) => {
  const { creatorId } = req.params as InferParams<typeof giftSchemas.leaderboard>;
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
