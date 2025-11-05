/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const { computeInsights } = require('./insights');
const marketingLoops = require('./marketing/loops');
const { listRegionalLedger } = require('./finance/ledger');
const { projectReinvestment } = require('./finance/reinvest');
const { listIntegrations, syncProvider } = require('./integrations/v3');
const learningService = require('./learning');
const { handleIntegrationWebhook } = require('../webhooks/integrations');

const PORT = Number(process.env.PORT || 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://dev.feelynx.live';

const aiRepairRouter = require('./routes/aiRepair');
const emotionFeedbackRouter = require('./routes/emotionFeedback');

const app = express();

// CORS for API routes
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

app.set('trust proxy', 1);
app.use(express.json());

app.use('/api/ai/repair', aiRepairRouter);
app.use('/api/emotion/feedback', emotionFeedbackRouter);

// Health endpoints
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/insights', (req, res) => {
  res.json(computeInsights());
});

app.get('/api/marketing/loops', (req, res) => {
  res.json({ loops: marketingLoops.listLoops() });
});

app.post('/api/marketing/loops', (req, res) => {
  try {
    const loop = marketingLoops.startLoop(req.body);
    res.status(201).json(loop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/marketing/loops/:id/experiments', (req, res) => {
  try {
    const loop = marketingLoops.recordExperiment(req.params.id, req.body.variant, req.body.result);
    res.json(loop);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/finance/ledger', (req, res) => {
  res.json(listRegionalLedger());
});

app.get('/api/finance/reinvest', (req, res) => {
  const netIncome = Number(req.query.netIncome ?? listRegionalLedger().totals.net);
  res.json(projectReinvestment(netIncome));
});

app.get('/api/integrations/v3', (req, res) => {
  res.json({ integrations: listIntegrations() });
});

app.post('/api/integrations/v3/:provider/sync', (req, res) => {
  try {
    const integration = syncProvider(req.params.provider);
    res.json(integration);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.get('/api/learning', (req, res) => {
  res.json(learningService.loadRoadmapInsights());
});

app.post('/api/learning', (req, res) => {
  res.json(learningService.generateRoadmapInsights());
});

app.post('/webhooks/integrations', (req, res) => {
  res.json(handleIntegrationWebhook(req.body));
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
