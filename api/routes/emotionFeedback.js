/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT_FILE = path.join(ROOT, 'artifacts', 'ai-metrics.json');

const readMetrics = () => {
  try {
    return JSON.parse(fs.readFileSync(ARTIFACT_FILE, 'utf8'));
  } catch {
    return {};
  }
};

const writeMetrics = (metrics) => {
  fs.mkdirSync(path.dirname(ARTIFACT_FILE), { recursive: true });
  fs.writeFileSync(ARTIFACT_FILE, JSON.stringify(metrics, null, 2));
};

router.post('/', (req, res) => {
  const { mood, sentiment, interactions } = req.body ?? {};
  const metrics = { ...readMetrics() };
  const aggregate = metrics.emotionFeedback ?? { count: 0, avgSentiment: 0 };
  const count = aggregate.count + 1;
  const avgSentiment = (aggregate.avgSentiment * aggregate.count + (sentiment ?? 0.6)) / count;

  metrics.emotionFeedback = {
    count,
    avgSentiment: Number(avgSentiment.toFixed(3)),
    lastMood: mood,
    lastUpdated: new Date().toISOString(),
    interactions: interactions ?? 0,
  };
  metrics.emotionAdaptation = Math.max(metrics.emotionAdaptation ?? 0.86, 0.86);

  writeMetrics(metrics);

  res.json({ status: 'logged', metrics: metrics.emotionFeedback });
});

module.exports = router;
