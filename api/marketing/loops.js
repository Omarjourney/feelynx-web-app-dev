/* eslint-disable @typescript-eslint/no-require-imports */
const { randomUUID } = require('node:crypto');

const activeLoops = new Map();

const SEGMENTS = {
  dormantFans: {
    label: 'Dormant Fans',
    trigger: 'no_purchase_30d',
    channel: ['email', 'discord'],
  },
  whales: {
    label: 'Token Whales',
    trigger: 'high_value_fan',
    channel: ['discord', 'sms'],
  },
  creators: {
    label: 'Creators Needing Boost',
    trigger: 'low_engagement_creator',
    channel: ['email'],
  },
};

function startLoop({ segmentKey, hypothesis, reward }) {
  const segment = SEGMENTS[segmentKey];
  if (!segment) {
    throw new Error(`Unknown segment: ${segmentKey}`);
  }

  const loopId = randomUUID();
  const record = {
    id: loopId,
    segmentKey,
    hypothesis,
    reward,
    segment,
    status: 'running',
    startedAt: new Date().toISOString(),
    lastTriggerAt: new Date().toISOString(),
    metrics: {
      uplift: Math.random() * 0.2 + 0.1,
      conversions: Math.floor(Math.random() * 900 + 120),
    },
  };

  activeLoops.set(loopId, record);
  return record;
}

function listLoops() {
  return Array.from(activeLoops.values());
}

function recordExperiment(loopId, variant, result) {
  const loop = activeLoops.get(loopId);
  if (!loop) {
    throw new Error('Loop not found');
  }

  loop.metrics = {
    ...loop.metrics,
    [`variant_${variant}`]: result,
  };
  loop.lastTriggerAt = new Date().toISOString();
  return loop;
}

module.exports = {
  listLoops,
  startLoop,
  recordExperiment,
  SEGMENTS,
};
