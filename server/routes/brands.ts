import { Router } from 'express';

const router = Router();

interface BrandBrief {
  id: string;
  name: string;
  budgetUsd: number;
  deliverables: string[];
  bonusTokens: number;
  status: 'open' | 'applied' | 'awarded';
}

const brandBriefs: BrandBrief[] = [
  {
    id: 'collab-vybe-water',
    name: 'Vybe Water',
    budgetUsd: 3500,
    deliverables: ['2 sponsored hydration shoutouts', 'Story highlight with token call-to-action'],
    bonusTokens: 1800,
    status: 'open',
  },
  {
    id: 'collab-sonic-galaxy',
    name: 'Sonic Galaxy Audio',
    budgetUsd: 5200,
    deliverables: ['Live unboxing session', 'AI remix using brand sfx'],
    bonusTokens: 3100,
    status: 'open',
  },
  {
    id: 'collab-mythos-fit',
    name: 'Mythos Fit',
    budgetUsd: 2700,
    deliverables: ['Micro-series (3 episodes)', 'Weekend challenge overlay'],
    bonusTokens: 2200,
    status: 'applied',
  },
];

const applications: Array<{
  id: string;
  creatorId: string;
  brandId: string;
  pitch: string;
  aiSummary: string;
  status: 'pending' | 'sent' | 'accepted';
  submittedAt: string;
}> = [];

router.get('/', (_req, res) => {
  res.json({
    briefs: brandBriefs,
    totalOpen: brandBriefs.filter((brief) => brief.status === 'open').length,
    totalApplied: brandBriefs.filter((brief) => brief.status !== 'open').length,
  });
});

router.post('/apply', (req, res) => {
  const { creatorId = 'creator-001', brandId, highlights = [] } = req.body ?? {};
  const brief = brandBriefs.find((item) => item.id === brandId);
  if (!brief) {
    res.status(404).json({ error: 'Brand brief not found' });
    return;
  }
  const aiSummary = `Proposal for ${brief.name}: ${highlights.length ? highlights.join(', ') : 'Feelynx signature energy + 💎 quests.'}`;
  const entry = {
    id: `application-${Date.now()}`,
    creatorId,
    brandId,
    pitch: `Let’s drive ${brief.name} resonance with premium fan tiers and a co-branded smart pack.`,
    aiSummary,
    status: 'sent' as const,
    submittedAt: new Date().toISOString(),
  };
  applications.push(entry);
  brief.status = 'applied';
  res.status(201).json({ application: entry, message: 'Brand proposal generated and dispatched.' });
});

router.get('/applications', (_req, res) => {
  res.json({ applications });
});

router.post('/applications/:id/accept', (req, res) => {
  const application = applications.find((item) => item.id === req.params.id);
  if (!application) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  application.status = 'accepted';
  const brief = brandBriefs.find((item) => item.id === application.brandId);
  if (brief) {
    brief.status = 'awarded';
  }
  res.json({ application, message: 'Collaboration locked! Bonus 💎 added to wallet ledger.' });
});

export default router;
