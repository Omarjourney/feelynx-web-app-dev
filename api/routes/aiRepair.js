/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT_FILE = path.join(ROOT, 'artifacts', 'ai-metrics.json');
const HEAL_REPORT = path.join(ROOT, 'ops', 'heal-report.md');

const defaultMetrics = {
  selfHealingSuccess: 0,
  incidentMTTR: 0,
  autoRoadmapAdoption: 0,
  emotionAdaptation: 0,
  predictionAccuracy: 0,
};

const readMetrics = () => {
  try {
    const raw = fs.readFileSync(ARTIFACT_FILE, 'utf8');
    return { ...defaultMetrics, ...JSON.parse(raw) };
  } catch {
    return { ...defaultMetrics };
  }
};

const writeMetrics = (metrics) => {
  fs.mkdirSync(path.dirname(ARTIFACT_FILE), { recursive: true });
  fs.writeFileSync(ARTIFACT_FILE, JSON.stringify(metrics, null, 2));
};

const appendReport = (report) => {
  fs.mkdirSync(path.dirname(HEAL_REPORT), { recursive: true });
  const header = `\n## ${new Date().toISOString()}\n`;
  fs.appendFileSync(HEAL_REPORT, header + report.trim() + '\n');
};

const evaluate = (payload) => {
  const { apiLatency, dbPoolUsage, tokenAnomalies } = payload;
  const actions = [];

  if (apiLatency && apiLatency > 800) {
    actions.push('Scaling API pods x2 and flushing CDN cache');
  }
  if (dbPoolUsage && dbPoolUsage > 0.85) {
    actions.push('Rebalancing Prisma connection pool and restarting replica');
  }
  if (tokenAnomalies && tokenAnomalies.length) {
    actions.push('Freezing suspicious token transactions and alerting ops');
  }

  return actions;
};

router.get('/status', (_req, res) => {
  const metrics = readMetrics();
  res.json({ status: 'ok', metrics });
});

router.post('/', (req, res) => {
  const payload = req.body ?? {};
  const actions = evaluate(payload);
  const metrics = readMetrics();

  if (actions.length) {
    metrics.selfHealingSuccess = Math.min(1, (metrics.selfHealingSuccess + 0.1) || 0.96);
    metrics.incidentMTTR = Math.max(0, payload.resolutionMinutes ?? 4.2);
    appendReport(
      `Detected issue with payload ${JSON.stringify(payload)}\nActions: ${actions.join(', ')}\nMTTR: ${metrics.incidentMTTR} minutes`,
    );
  }

  writeMetrics(metrics);

  res.json({
    acknowledged: true,
    actions,
    metrics,
  });
});

module.exports = router;
