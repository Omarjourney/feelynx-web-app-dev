/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('node:path');
const fs = require('node:fs');

const DATASET_PATH = path.join(process.cwd(), 'artifacts', 'scorecard.json');

function loadKpiSnapshot() {
  if (!fs.existsSync(DATASET_PATH)) {
    return {
      enterprisePartners: 0,
      predictiveAccuracy: 0,
      retentionIncrease: 0,
      activeRegions: 0,
      reinvestmentRatio: 0,
    };
  }

  const raw = fs.readFileSync(DATASET_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  return parsed.kpis ?? parsed;
}

function computeInsights() {
  const kpis = loadKpiSnapshot();

  return {
    generatedAt: new Date().toISOString(),
    enterprisePartners: kpis.enterprisePartners ?? 12,
    predictiveAccuracy: kpis.predictiveAccuracy ?? 0.87,
    retentionIncrease: kpis.retentionIncrease ?? 0.31,
    activeRegions: kpis.activeRegions ?? 9,
    reinvestmentRatio: kpis.reinvestmentRatio ?? 0.12,
    forecasts: {
      creatorRetention: {
        current: 0.82,
        nextQuarter: 0.86,
      },
      tokenVelocity: {
        current: 4200,
        projected: 4800,
      },
      contentTrends: [
        { category: 'Live Workshops', growth: 0.28 },
        { category: 'AI Collaborations', growth: 0.34 },
        { category: 'Premium Drops', growth: 0.19 },
      ],
    },
  };
}

module.exports = {
  computeInsights,
};
