/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('node:path');
const fs = require('node:fs');

const ROADMAP_PATH = path.join(process.cwd(), 'roadmap_insights.json');

const defaultInitiatives = [
  {
    id: 'roadmap-01',
    focus: 'Creator Success',
    impact: 'high',
    description:
      'Launch concierge onboarding squads for enterprise partner creators to accelerate monetization.',
    etaDays: 60,
  },
  {
    id: 'roadmap-02',
    focus: 'AI Analytics',
    impact: 'high',
    description: 'Deploy predictive churn interventions into marketing loops with autonomous experimentation.',
    etaDays: 45,
  },
  {
    id: 'roadmap-03',
    focus: 'Infrastructure',
    impact: 'medium',
    description: 'Expand multi-region Supabase replicas to cover LATAM and MENA markets with automated compliance.',
    etaDays: 90,
  },
];

function generateRoadmapInsights() {
  if (typeof window !== 'undefined') {
    return {
      generatedAt: new Date().toISOString(),
      initiatives: defaultInitiatives,
    };
  }

  const initiatives = [
    {
      id: 'roadmap-01',
      focus: 'Creator Success',
      impact: 'high',
      description: 'Launch concierge onboarding squads for enterprise partner creators to accelerate monetization.',
      etaDays: 60,
    },
    {
      id: 'roadmap-02',
      focus: 'AI Analytics',
      impact: 'high',
      description: 'Deploy predictive churn interventions into marketing loops with autonomous experimentation.',
      etaDays: 45,
    },
    {
      id: 'roadmap-03',
      focus: 'Infrastructure',
      impact: 'medium',
      description: 'Expand multi-region Supabase replicas to cover LATAM and MENA markets with automated compliance.',
      etaDays: 90,
    },
  ];

  const payload = {
    generatedAt: new Date().toISOString(),
    initiatives,
  };

  fs.writeFileSync(ROADMAP_PATH, JSON.stringify(payload, null, 2));
  return payload;
}

function loadRoadmapInsights() {
  if (typeof window !== 'undefined') {
    return {
      generatedAt: new Date().toISOString(),
      initiatives: defaultInitiatives,
    };
  }

  if (!fs.existsSync(ROADMAP_PATH)) {
    return generateRoadmapInsights();
  }

  const raw = fs.readFileSync(ROADMAP_PATH, 'utf8');
  return JSON.parse(raw);
}

module.exports = {
  generateRoadmapInsights,
  loadRoadmapInsights,
};
