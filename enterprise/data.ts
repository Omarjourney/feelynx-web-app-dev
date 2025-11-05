export const ledgerSnapshot = {
  rows: [
    {
      region: 'North America',
      revenue: 182000,
      payouts: 72000,
      taxes: 22000,
      net: 88000,
    },
    {
      region: 'Europe',
      revenue: 143000,
      payouts: 58000,
      taxes: 19000,
      net: 66000,
    },
    {
      region: 'Asia Pacific',
      revenue: 96000,
      payouts: 41000,
      taxes: 12000,
      net: 43000,
    },
  ],
  totals: {
    revenue: 421000,
    payouts: 171000,
    taxes: 53000,
    net: 197000,
  },
};

export function getLedgerSnapshot() {
  return ledgerSnapshot;
}

export function getReinvestmentPlan(netIncome = ledgerSnapshot.totals.net) {
  const reinvestmentPool = Math.round(netIncome * 0.18);
  return {
    netIncome,
    reinvestmentPool,
    ratio: Number((reinvestmentPool / netIncome).toFixed(2)),
    allocations: {
      creatorGrants: Math.round(reinvestmentPool * 0.45),
      marketing: Math.round(reinvestmentPool * 0.35),
      researchAndDevelopment: Math.round(reinvestmentPool * 0.2),
    },
  };
}

export const roadmapSnapshot = {
  generatedAt: new Date().toISOString(),
  initiatives: [
    {
      id: 'roadmap-01',
      focus: 'Creator Success',
      impact: 'high' as const,
      description: 'Launch concierge onboarding squads for enterprise partner creators to accelerate monetization.',
      etaDays: 60,
    },
    {
      id: 'roadmap-02',
      focus: 'AI Analytics',
      impact: 'high' as const,
      description: 'Deploy predictive churn interventions into marketing loops with autonomous experimentation.',
      etaDays: 45,
    },
    {
      id: 'roadmap-03',
      focus: 'Infrastructure',
      impact: 'medium' as const,
      description: 'Expand multi-region Supabase replicas to cover LATAM and MENA markets with automated compliance.',
      etaDays: 90,
    },
  ],
};

export function refreshRoadmapSnapshot() {
  return {
    ...roadmapSnapshot,
    generatedAt: new Date().toISOString(),
  };
}
