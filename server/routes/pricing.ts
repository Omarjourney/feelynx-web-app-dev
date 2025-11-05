import { Router } from 'express';

const router = Router();

let baseRate = 0.05;
let demandSignal = 1.08;

const bundlePresets = [
  { id: 'starter', tokens: 1200, bonus: 5, tagline: 'Warm up returning fans' },
  { id: 'growth', tokens: 3600, bonus: 12, tagline: 'Stream weekend accelerator' },
  { id: 'stadium', tokens: 8000, bonus: 20, tagline: 'Peak event domination' },
  { id: 'legend', tokens: 15000, bonus: 28, tagline: 'Unlock new tier reactions' },
];

router.get('/', (_req, res) => {
  const volatilityIndex = Number(((Math.random() * 0.08 + 0.94) * demandSignal).toFixed(3));
  const liveRate = Number((baseRate * demandSignal * volatilityIndex).toFixed(4));
  res.json({
    baseRate,
    demandSignal,
    volatilityIndex,
    liveRate,
    lastUpdated: new Date().toISOString(),
    rationale: 'Simulation tracks token redemption velocity & live-room conversion trends.',
    recommendedBundles: bundlePresets.map((bundle, index) => ({
      ...bundle,
      usdValue: Number((bundle.tokens * liveRate).toFixed(2)),
      aiConfidence: Number((0.76 + index * 0.05).toFixed(2)),
    })),
  });
});

router.post('/smart-pack', (req, res) => {
  const { weeklyStreams = 5, averageTips = 8500, superfans = 120 } = req.body ?? {};
  const intensityScore = Number(
    (
      weeklyStreams * 0.2 +
      (averageTips / 1000) * 0.35 +
      (superfans / 100) * 0.45
    ).toFixed(2),
  );
  const pack =
    intensityScore < 3
      ? bundlePresets[0]
      : intensityScore < 5
        ? bundlePresets[1]
        : intensityScore < 7
          ? bundlePresets[2]
          : bundlePresets[3];

  const conversionBoost = Number((Math.min(12, intensityScore * 1.6)).toFixed(2));
  res.json({
    recommendedPack: {
      ...pack,
      usdValue: Number((pack.tokens * baseRate * demandSignal).toFixed(2)),
    },
    insights: {
      intensityScore,
      conversionBoost,
      notes: intensityScore > 6
        ? 'You are pacing like top 5% creators — schedule a premium drop this weekend.'
        : 'Keep a steady cadence. Consider highlighting VIP reaction packs mid-stream.',
    },
  });
});

router.get('/forecast', (req, res) => {
  const { pastSeven = '5200,6400,5900,7200,6100,6800,7400' } = req.query;
  const history = String(pastSeven)
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);
  const average = history.reduce((total, value) => total + value, 0) / (history.length || 1);
  const momentum = history.length > 2 ? history[history.length - 1] - history[0] : 0;
  const projected = Math.max(average + momentum * 0.25, 1200);
  const variance = Number((Math.min(0.35, Math.abs(momentum) / 8000 + 0.12)).toFixed(2));

  res.json({
    history,
    projectedTokens: Math.round(projected),
    variance,
    confidence: variance > 0.28 ? 'medium' : 'high',
    callouts: [
      momentum > 0
        ? 'Demand is compounding — prep exclusive bundles for late week.'
        : 'Audience stable — try midweek token drops to nudge velocity.',
      variance > 0.25
        ? 'Expect fluctuations. Pin a Smart Pack to keep superfans ready.'
        : 'Forecast steady — align merch drops with predicted high days.',
    ],
  });
});

router.post('/override', (req, res) => {
  const { rate, demand } = req.body ?? {};
  if (rate && (!Number.isFinite(Number(rate)) || Number(rate) <= 0)) {
    res.status(400).json({ error: 'rate must be positive' });
    return;
  }
  if (demand && (!Number.isFinite(Number(demand)) || Number(demand) <= 0)) {
    res.status(400).json({ error: 'demand must be positive' });
    return;
  }
  if (rate) {
    baseRate = Number(rate);
  }
  if (demand) {
    demandSignal = Number(demand);
  }
  res.json({ baseRate, demandSignal, updatedAt: new Date().toISOString() });
});

export default router;
