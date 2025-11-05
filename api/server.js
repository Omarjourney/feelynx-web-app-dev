/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://dev.feelynx.live';

const app = express();

const LOG_DIR = path.join(__dirname, '..', 'logs');
const AIOPS_LOG = path.join(LOG_DIR, 'aiops.json');
const COMPLIANCE_LOG = path.join(LOG_DIR, 'compliance.json');
const EXPLAINABILITY_LOG = path.join(LOG_DIR, 'explainability.json');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const ensureFile = (filePath, fallback = '[]') => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, fallback);
  }
};

ensureFile(AIOPS_LOG);
ensureFile(COMPLIANCE_LOG);
ensureFile(EXPLAINABILITY_LOG);

const ENCRYPTION_SECRET = process.env.AI_ENCRYPTION_KEY || 'feelynx-phase5-default-key';
const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(ENCRYPTION_SECRET)
  .digest();

const encryptPayload = (payload) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-ctr', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  return { iv: iv.toString('hex'), data: encrypted.toString('hex') };
};

const appendJsonLog = (filePath, entry) => {
  const existing = fs.readFileSync(filePath, 'utf8');
  const parsed = existing ? JSON.parse(existing) : [];
  parsed.push(entry);
  fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));
};

const aiopsState = {
  latencyMs: 118,
  engagement: 0.72,
  tokenVelocity: 64,
  lastOptimizedAt: Date.now(),
  recommendations: [
    {
      id: 'ui-latency',
      focus: 'Reduce lobby hero image weight',
      impact: '+8% faster cold starts',
      explanation: 'Image compression to 120kb removes 140ms of blocking time for 40% of visitors.',
    },
  ],
};

const recordExplainability = (source, message, rationale) => {
  appendJsonLog(EXPLAINABILITY_LOG, {
    source,
    message,
    rationale,
    timestamp: Date.now(),
  });
};

// CORS for API routes
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

app.set('trust proxy', 1);
app.use(express.json());

// Health endpoints
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Example REST route
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend' });
});

app.post('/api/agent/creator', (req, res) => {
  const { intent, prompt } = req.body || {};
  const now = new Date();
  let message = 'Here is a strategic update for your channel.';
  let explanation =
    'Recommendations use your historical engagement peaks, retention heatmaps, and sentiment vectors to stay aligned with audience momentum.';
  const response = { message, explanation };

  if (intent === 'autoPlanWeek') {
    const baseHour = 18;
    const schedule = Array.from({ length: 4 }).map((_, index) => {
      const day = ['Monday', 'Wednesday', 'Friday', 'Sunday'][index];
      return {
        day,
        start: `${baseHour + index}:00`,
        focus: index % 2 === 0 ? 'VIP Q&A + drop' : 'Studio session + collab',
      };
    });
    response.message = 'Autonomous planner locked in prime engagement windows for this week.';
    response.schedule = schedule;
    response.explanation =
      'Slotting targets the 19:00-22:00 fan clusters where repeat viewers sustain +32% tip velocity.';
  } else if (intent === 'generatePost') {
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
    response.message = 'Draft ready. Fine-tune the hook or add calls-to-action as needed.';
    response.postDraft = `Going live ${dayName} night! Expect exclusive drops, backstage gossip and a fresh collab. 🔥\n\nTap to set a reminder — tokens earn double loyalty multipliers.`;
    response.explanation =
      'Copy balances urgency and reward incentives because your audience’s conversion spikes when exclusivity is paired with loyalty perks.';
  } else {
    response.message = prompt
      ? `Here’s what I’m seeing: ${prompt}`
      : 'Standing by. Ask me about schedules, promos or strategy upgrades.';
  }

  recordExplainability('creator-agent', intent || 'prompt', response.explanation);
  res.json(response);
});

app.post('/api/agent/fan', (req, res) => {
  const { intent } = req.body || {};
  const recommendations = [
    {
      id: 'creator-stella-nova',
      title: 'Stella Nova • Cosmic Sessions',
      type: 'creator',
      description: 'Live synthwave studio night with chat-powered loops.',
      explanation: 'You binge interactive music streams and stay longest when the creator involves fan-submitted samples.',
    },
    {
      id: 'event-horizon-festival',
      title: 'Event Horizon Festival Access',
      type: 'event',
      description: '48h VR micro-festival curated for night owls in your timezone.',
      explanation: 'You engage most between 22:00-01:00; this event peaks precisely in that window.',
    },
    {
      id: 'token-pack-boost',
      title: '1200⚡ Creator Boost Pack',
      type: 'pack',
      description: 'Unlock 15% bonus perks on tipping streaks this weekend.',
      explanation: 'Token redemptions jump when bundles pair with live collabs you’ve RSVP’d to.',
    },
  ];

  recordExplainability('fan-agent', intent || 'vibeFeed', 'Fan companion surfaces feed insights by clustering viewing streaks and tip cadences.');
  res.json({ recommendations });
});

app.get('/api/aiops', (_req, res) => {
  res.json(aiopsState);
});

app.post('/api/aiops', (req, res) => {
  const { latencyMs, engagement, tokenVelocity } = req.body || {};
  const snapshot = {
    latencyMs: Number.isFinite(latencyMs) ? latencyMs : aiopsState.latencyMs,
    engagement: typeof engagement === 'number' ? engagement : aiopsState.engagement,
    tokenVelocity: Number.isFinite(tokenVelocity) ? tokenVelocity : aiopsState.tokenVelocity,
  };

  aiopsState.latencyMs = Math.max(60, Math.min(240, snapshot.latencyMs));
  aiopsState.engagement = Math.min(0.99, Math.max(0.2, snapshot.engagement));
  aiopsState.tokenVelocity = Math.max(12, Math.min(200, snapshot.tokenVelocity));
  aiopsState.lastOptimizedAt = Date.now();

  const recommendations = [];
  if (aiopsState.latencyMs > 160) {
    recommendations.push({
      id: 'latency-routing',
      focus: 'Shift realtime traffic to edge ingress POP',
      impact: '-90ms roundtrip for 68% of viewers',
      explanation: 'Telemetry spotted congestion on the default ingress. Routing to the Madrid POP aligns with viewer density.',
    });
  }
  if (aiopsState.engagement < 0.6) {
    recommendations.push({
      id: 'engagement-labs',
      focus: 'Deploy interactive overlays to top 5 creators',
      impact: '+12% chat activation',
      explanation: 'Engagement dips correlate with long-form segments; overlays reinject micro-missions every 6 minutes.',
    });
  }
  if (aiopsState.tokenVelocity < 50) {
    recommendations.push({
      id: 'token-loyalty',
      focus: 'Enable loyalty multiplier for returning fans',
      impact: '+22% token circulation',
      explanation: 'Returning fans respond to streak multipliers; applying them during collaboration nights increases ARPU.',
    });
  }
  aiopsState.recommendations = recommendations.length ? recommendations : aiopsState.recommendations;

  appendJsonLog(AIOPS_LOG, {
    timestamp: aiopsState.lastOptimizedAt,
    metrics: encryptPayload({
      latencyMs: aiopsState.latencyMs,
      engagement: aiopsState.engagement,
      tokenVelocity: aiopsState.tokenVelocity,
    }),
    recommendations: aiopsState.recommendations,
  });

  recordExplainability('aiops', 'metric-ingest', `Adjusted ${aiopsState.recommendations.length} optimization tracks based on live telemetry.`);
  res.json(aiopsState);
});

app.post('/api/compliance', (req, res) => {
  const { actor, action, context, pii } = req.body || {};
  const entry = {
    actor: actor ?? 'system',
    action: action ?? 'unknown',
    context: context ?? {},
    pii: pii ? encryptPayload(pii) : undefined,
    timestamp: Date.now(),
  };
  appendJsonLog(COMPLIANCE_LOG, entry);
  res.json({ status: 'logged' });
});

app.get('/api/compliance', (_req, res) => {
  try {
    const entries = JSON.parse(fs.readFileSync(COMPLIANCE_LOG, 'utf8'));
    res.json({ entries: entries.slice(-20) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to read compliance log', error: String(error) });
  }
});

const server = http.createServer(app);

// Socket.io behind Nginx, on default path /socket.io
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('ping', (data) => {
    socket.emit('pong', { now: Date.now(), echo: data });
  });

  socket.on('disconnect', (reason) => {
    console.log('socket disconnected', socket.id, reason);
  });
});

server.listen(PORT, () => {
  console.log(`Backend listening on ${PORT}`);
});
