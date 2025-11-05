import { Router } from 'express';

const router = Router();

type TipEvent = {
  amount: number;
  timestamp: string;
  sentiment?: 'hype' | 'chill' | 'supportive';
};

type ViewerPulse = {
  day: string;
  avgWatchMinutes: number;
  retention: number;
};

function deriveGuidance(tips: TipEvent[], viewers: ViewerPulse[]) {
  const suggestions: string[] = [];

  const weekendTips = tips.filter((tip) => {
    const day = new Date(tip.timestamp).getUTCDay();
    return day === 0 || day === 6;
  });
  const weekdayTips = tips.length - weekendTips.length;
  if (weekendTips.length > weekdayTips) {
    suggestions.push('Your fans tip more on weekends — schedule spotlight sessions Friday night.');
  } else {
    suggestions.push('Weekday sessions carry momentum. Add office-hour style hangs Tue/Wed.');
  }

  const hypeBursts = tips.filter((tip) => tip.sentiment === 'hype');
  if (hypeBursts.length > 2) {
    suggestions.push('Lean into shorter, high-energy bursts. Layer reaction goals at 15 minute marks.');
  }

  const avgWatch = viewers.reduce((total, viewer) => total + viewer.avgWatchMinutes, 0) / (viewers.length || 1);
  if (avgWatch < 28) {
    suggestions.push('Tighten intros. Kick off with a poll or challenge to boost early retention.');
  } else {
    suggestions.push('Long-form vibes are working — drop premium tiers mid-session to reward loyalty.');
  }

  const retentionDip = viewers.find((viewer) => viewer.retention < 0.62);
  if (retentionDip) {
    suggestions.push(
      `Retention dipped on ${retentionDip.day}. Add custom reactions or giveaways to energize that block.`,
    );
  }

  if (suggestions.length < 3) {
    suggestions.push('Experiment with limited-time 💎 bundles right before your finale segment.');
  }

  return suggestions;
}

router.post('/', (req, res) => {
  const { tips = [], viewers = [], monetizationGoal = 12000 } = req.body ?? {};
  const normalizedTips: TipEvent[] = Array.isArray(tips)
    ? tips
        .map((tip) => ({
          amount: Number(tip.amount ?? 0),
          timestamp: tip.timestamp ?? new Date().toISOString(),
          sentiment: tip.sentiment ?? 'supportive',
        }))
        .filter((tip) => Number.isFinite(tip.amount))
    : [];

  const normalizedViewers: ViewerPulse[] = Array.isArray(viewers)
    ? viewers
        .map((viewer) => ({
          day: viewer.day ?? 'Mon',
          avgWatchMinutes: Number(viewer.avgWatchMinutes ?? 0),
          retention: Number(viewer.retention ?? 0.55),
        }))
        .filter((viewer) => Number.isFinite(viewer.avgWatchMinutes))
    : [];

  const totalTips = normalizedTips.reduce((total, tip) => total + tip.amount, 0);
  const goalProgress = Number(((totalTips / monetizationGoal) * 100).toFixed(1));

  res.json({
    summary: {
      monetizationGoal,
      totalTips,
      goalProgress: Number.isFinite(goalProgress) ? goalProgress : 0,
    },
    guidance: deriveGuidance(normalizedTips, normalizedViewers),
    actions: [
      {
        label: 'Add custom weekend reactions',
        impact: '+18% tips',
      },
      {
        label: 'Highlight VIP micro-subs with energy meter',
        impact: '+12% recurring',
      },
      {
        label: 'Publish 3-pack bundle teaser in stories',
        impact: '+9% conversions',
      },
    ],
  });
});

export default router;
