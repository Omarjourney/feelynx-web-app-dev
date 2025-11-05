import { Router } from 'express';
import { randomUUID } from 'crypto';

interface LedgerTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: 'TOKENS' | 'USD';
  type: 'earn' | 'spend' | 'conversion' | 'withdrawal' | 'adjustment';
  usdEquivalent: number;
  reference: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface WalletSnapshot {
  tokens: number;
  fiatUsd: number;
}

const router = Router();

const tokenBaseRateUsd = 0.05; // baseline USD value per 💎 token
const walletSnapshot: WalletSnapshot = {
  tokens: 48250,
  fiatUsd: 1640,
};

const weeklyEarnings: { date: string; tokens: number; usd: number }[] = Array.from({ length: 7 }).map(
  (_, index) => {
    const date = new Date();
    date.setUTCHours(12, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (6 - index));
    const tokens = 5200 + Math.round(Math.sin(index) * 650);
    const usd = Number((tokens * tokenBaseRateUsd).toFixed(2));
    return { date: date.toISOString().slice(0, 10), tokens, usd };
  },
);

const ledger: LedgerTransaction[] = [
  {
    id: randomUUID(),
    userId: 'creator-001',
    amount: 1250,
    currency: 'TOKENS',
    type: 'earn',
    usdEquivalent: Number((1250 * tokenBaseRateUsd).toFixed(2)),
    reference: 'tips#weekend-rally',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    metadata: { source: 'live-room', peakViewers: 940 },
  },
  {
    id: randomUUID(),
    userId: 'creator-001',
    amount: -450,
    currency: 'TOKENS',
    type: 'spend',
    usdEquivalent: Number((-450 * tokenBaseRateUsd).toFixed(2)),
    reference: 'reaction-pack-upgrade',
    timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    metadata: { sku: 'reaction-pack-pro', audience: 'superfans' },
  },
  {
    id: randomUUID(),
    userId: 'creator-001',
    amount: 320,
    currency: 'USD',
    type: 'withdrawal',
    usdEquivalent: 320,
    reference: 'stripe#payout-9235',
    timestamp: new Date(Date.now() - (24 + 2) * 60 * 60 * 1000).toISOString(),
    metadata: { method: 'stripe-connect', status: 'completed' },
  },
];

const payoutLog: Array<{
  id: string;
  userId: string;
  method: 'stripe' | 'coinbase';
  amountUsd: number;
  currency: 'USD' | 'EUR' | 'COP';
  status: 'pending' | 'processing' | 'completed';
  requestedAt: string;
  updatedAt: string;
}> = [
  {
    id: randomUUID(),
    userId: 'creator-001',
    method: 'stripe',
    amountUsd: 250,
    currency: 'USD',
    status: 'completed',
    requestedAt: new Date(Date.now() - (3 * 24 + 4) * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - (2 * 24 + 18) * 60 * 60 * 1000).toISOString(),
  },
  {
    id: randomUUID(),
    userId: 'creator-001',
    method: 'coinbase',
    amountUsd: 140,
    currency: 'EUR',
    status: 'processing',
    requestedAt: new Date(Date.now() - (1 * 24 + 6) * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

function pushTransaction(tx: LedgerTransaction) {
  ledger.unshift(tx);
  if (tx.currency === 'TOKENS') {
    walletSnapshot.tokens += tx.amount;
  } else {
    walletSnapshot.fiatUsd += tx.amount;
  }
}

router.get('/', (_req, res) => {
  const currentRate = tokenBaseRateUsd * 1.08; // simulated demand boost
  const usdFromTokens = Number((walletSnapshot.tokens * currentRate).toFixed(2));
  const trailingSevenUsd = weeklyEarnings.reduce((total, day) => total + day.usd, 0);
  const trailingSevenTokens = weeklyEarnings.reduce((total, day) => total + day.tokens, 0);

  res.json({
    balances: {
      tokens: walletSnapshot.tokens,
      fiatUsd: Number(walletSnapshot.fiatUsd.toFixed(2)),
      totalUsdEquivalent: Number((usdFromTokens + walletSnapshot.fiatUsd).toFixed(2)),
    },
    currentRate,
    trailingSeven: {
      tokens: trailingSevenTokens,
      usd: Number(trailingSevenUsd.toFixed(2)),
      dailyBreakdown: weeklyEarnings,
    },
    recentTransactions: ledger.slice(0, 8),
    payoutLog,
  });
});

router.get('/transactions', (_req, res) => {
  res.json({ transactions: ledger });
});

router.post('/record', (req, res) => {
  const { userId = 'creator-001', amount, currency, type, reference, metadata } = req.body ?? {};
  if (!Number.isFinite(Number(amount))) {
    res.status(400).json({ error: 'amount must be numeric' });
    return;
  }
  if (!['TOKENS', 'USD'].includes(currency)) {
    res.status(400).json({ error: 'currency must be TOKENS or USD' });
    return;
  }
  const normalizedType =
    type && ['earn', 'spend', 'conversion', 'withdrawal', 'adjustment'].includes(type)
      ? (type as LedgerTransaction['type'])
      : 'adjustment';
  const numericAmount = Number(amount);
  const usdEquivalent =
    currency === 'TOKENS'
      ? Number((numericAmount * tokenBaseRateUsd).toFixed(2))
      : Number(numericAmount.toFixed(2));
  const tx: LedgerTransaction = {
    id: randomUUID(),
    userId,
    amount: numericAmount,
    currency,
    type: normalizedType,
    usdEquivalent,
    reference: reference || 'manual-ledger-entry',
    timestamp: new Date().toISOString(),
    metadata,
  };
  pushTransaction(tx);
  res.status(201).json(tx);
});

router.post('/convert', (req, res) => {
  const { direction, amount } = req.body ?? {};
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    res.status(400).json({ error: 'amount must be a positive number' });
    return;
  }
  const currentRate = tokenBaseRateUsd * 1.08;
  if (direction === 'tokens-to-usd') {
    if (walletSnapshot.tokens < numericAmount) {
      res.status(400).json({ error: 'insufficient tokens' });
      return;
    }
    const usdValue = Number((numericAmount * currentRate).toFixed(2));
    const conversion: LedgerTransaction = {
      id: randomUUID(),
      userId: 'creator-001',
      amount: -numericAmount,
      currency: 'TOKENS',
      type: 'conversion',
      usdEquivalent: -usdValue,
      reference: 'conversion:tokens-to-usd',
      timestamp: new Date().toISOString(),
    };
    const payout: LedgerTransaction = {
      id: randomUUID(),
      userId: 'creator-001',
      amount: usdValue,
      currency: 'USD',
      type: 'conversion',
      usdEquivalent: usdValue,
      reference: 'conversion:usd-credit',
      timestamp: new Date().toISOString(),
    };
    pushTransaction(conversion);
    pushTransaction(payout);
    res.json({ conversion, payout });
    return;
  }
  if (direction === 'usd-to-tokens') {
    if (walletSnapshot.fiatUsd < numericAmount) {
      res.status(400).json({ error: 'insufficient USD balance' });
      return;
    }
    const tokens = Math.floor(numericAmount / currentRate);
    const conversion: LedgerTransaction = {
      id: randomUUID(),
      userId: 'creator-001',
      amount: -numericAmount,
      currency: 'USD',
      type: 'conversion',
      usdEquivalent: -numericAmount,
      reference: 'conversion:usd-to-tokens',
      timestamp: new Date().toISOString(),
    };
    const tokenCredit: LedgerTransaction = {
      id: randomUUID(),
      userId: 'creator-001',
      amount: tokens,
      currency: 'TOKENS',
      type: 'conversion',
      usdEquivalent: Number((tokens * currentRate).toFixed(2)),
      reference: 'conversion:token-credit',
      timestamp: new Date().toISOString(),
    };
    pushTransaction(conversion);
    pushTransaction(tokenCredit);
    res.json({ conversion, tokenCredit });
    return;
  }
  res.status(400).json({ error: 'direction must be tokens-to-usd or usd-to-tokens' });
});

router.post('/withdraw', (req, res) => {
  const { amountUsd, currency = 'USD', method = 'stripe' } = req.body ?? {};
  const numericAmount = Number(amountUsd);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    res.status(400).json({ error: 'amountUsd must be positive' });
    return;
  }
  if (!['USD', 'EUR', 'COP'].includes(currency)) {
    res.status(400).json({ error: 'Unsupported currency' });
    return;
  }
  if (!['stripe', 'coinbase'].includes(method)) {
    res.status(400).json({ error: 'Unsupported withdrawal method' });
    return;
  }
  if (walletSnapshot.fiatUsd < numericAmount) {
    res.status(400).json({ error: 'Insufficient balance' });
    return;
  }

  const payoutEntry = {
    id: randomUUID(),
    userId: 'creator-001',
    method: method as 'stripe' | 'coinbase',
    amountUsd: Number(numericAmount.toFixed(2)),
    currency: currency as 'USD' | 'EUR' | 'COP',
    status: 'pending' as const,
    requestedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  payoutLog.unshift(payoutEntry);

  const debit: LedgerTransaction = {
    id: randomUUID(),
    userId: 'creator-001',
    amount: -numericAmount,
    currency: 'USD',
    type: 'withdrawal',
    usdEquivalent: -numericAmount,
    reference: `withdraw:${method}`,
    timestamp: new Date().toISOString(),
    metadata: { currency },
  };
  pushTransaction(debit);

  res.status(202).json({
    payout: payoutEntry,
    message: 'Withdrawal scheduled. Track status via /api/payouts/status.',
  });
});

router.get('/payout-log', (_req, res) => {
  res.json({ payouts: payoutLog });
});

export default router;
