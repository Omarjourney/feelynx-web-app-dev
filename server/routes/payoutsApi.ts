import { Router } from 'express';

const router = Router();

const payoutStatus = new Map<string, {
  id: string;
  currency: 'USD' | 'EUR' | 'COP';
  destination: 'stripe' | 'coinbase';
  amountUsd: number;
  status: 'pending' | 'processing' | 'completed';
  estimatedArrival: string;
}>();

const complianceProfiles = new Map<string, {
  userId: string;
  taxId: string;
  country: string;
  kycStatus: 'unverified' | 'review' | 'verified';
  updatedAt: string;
}>();

function bootstrap() {
  const now = new Date();
  const iso = now.toISOString();
  payoutStatus.set('demo-1', {
    id: 'demo-1',
    currency: 'USD',
    destination: 'stripe',
    amountUsd: 280,
    status: 'processing',
    estimatedArrival: new Date(now.getTime() + 36 * 60 * 60 * 1000).toISOString(),
  });
  payoutStatus.set('demo-2', {
    id: 'demo-2',
    currency: 'COP',
    destination: 'coinbase',
    amountUsd: 95,
    status: 'pending',
    estimatedArrival: new Date(now.getTime() + 60 * 60 * 60 * 1000).toISOString(),
  });
  complianceProfiles.set('creator-001', {
    userId: 'creator-001',
    taxId: 'US-77-3021',
    country: 'US',
    kycStatus: 'verified',
    updatedAt: iso,
  });
  complianceProfiles.set('creator-CO-44', {
    userId: 'creator-CO-44',
    taxId: 'CO-90056789-1',
    country: 'CO',
    kycStatus: 'review',
    updatedAt: iso,
  });
}

bootstrap();

router.get('/', (_req, res) => {
  res.json({
    payouts: Array.from(payoutStatus.values()),
    complianceProfiles: Array.from(complianceProfiles.values()),
    supportedCurrencies: ['USD', 'EUR', 'COP'],
    providers: {
      fiat: 'Stripe Connect',
      crypto: 'Coinbase Commerce',
    },
  });
});

router.post('/create', (req, res) => {
  const { userId = 'creator-001', currency = 'USD', amountUsd = 120, destination = 'stripe' } = req.body ?? {};
  if (!['USD', 'EUR', 'COP'].includes(currency)) {
    res.status(400).json({ error: 'Unsupported currency' });
    return;
  }
  if (!['stripe', 'coinbase'].includes(destination)) {
    res.status(400).json({ error: 'Unsupported destination' });
    return;
  }
  const numericAmount = Number(amountUsd);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    res.status(400).json({ error: 'amountUsd must be positive' });
    return;
  }
  const id = `payout-${Date.now()}`;
  const eta = new Date(Date.now() + (destination === 'stripe' ? 48 : 30) * 60 * 60 * 1000).toISOString();
  const entry = {
    id,
    currency: currency as 'USD' | 'EUR' | 'COP',
    destination: destination as 'stripe' | 'coinbase',
    amountUsd: Number(numericAmount.toFixed(2)),
    status: 'pending' as const,
    estimatedArrival: eta,
  };
  payoutStatus.set(id, entry);
  res.status(201).json({ payout: entry, message: 'Payout created. Monitor status for real-time updates.' });
});

router.post('/status', (req, res) => {
  const { id, status } = req.body ?? {};
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'id is required' });
    return;
  }
  if (!['pending', 'processing', 'completed'].includes(status)) {
    res.status(400).json({ error: 'invalid status' });
    return;
  }
  const existing = payoutStatus.get(id);
  if (!existing) {
    res.status(404).json({ error: 'payout not found' });
    return;
  }
  const updated = { ...existing, status: status as 'pending' | 'processing' | 'completed', estimatedArrival: existing.estimatedArrival };
  payoutStatus.set(id, updated);
  res.json({ payout: updated });
});

router.post('/compliance', (req, res) => {
  const { userId, taxId, country, kycStatus = 'review' } = req.body ?? {};
  if (!userId || !taxId || !country) {
    res.status(400).json({ error: 'userId, taxId and country are required' });
    return;
  }
  if (!['unverified', 'review', 'verified'].includes(kycStatus)) {
    res.status(400).json({ error: 'Invalid kycStatus' });
    return;
  }
  const profile = {
    userId,
    taxId,
    country,
    kycStatus: kycStatus as 'unverified' | 'review' | 'verified',
    updatedAt: new Date().toISOString(),
  };
  complianceProfiles.set(userId, profile);
  res.json({ profile });
});

router.get('/status/:id', (req, res) => {
  const payout = payoutStatus.get(req.params.id);
  if (!payout) {
    res.status(404).json({ error: 'payout not found' });
    return;
  }
  const statusFlow: Array<'pending' | 'processing' | 'completed'> = ['pending', 'processing', 'completed'];
  const stageIndex = statusFlow.indexOf(payout.status);
  res.json({
    payout,
    journey: statusFlow.map((stage, index) => ({
      stage,
      completed: index <= stageIndex,
    })),
  });
});

export default router;
