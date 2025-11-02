var _a;
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { subscribe as subscribeControl, unsubscribe as unsubscribeControl } from './wsControl';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import postsRoutes from './routes/posts';
import paymentsRoutes from './routes/payments';
import { webhookHandler as paymentsWebhookHandler } from './routes/payments';
import livekitRoutes from './routes/livekit';
import creatorsRoutes from './routes/creators';
import streamRoutes from './routes/stream';
import giftsRoutes from './routes/gifts';
import roomsRoutes from './routes/rooms';
import moderationRoutes from './routes/moderation';
import controlRoutes from './routes/control';
import toysRoutes from './routes/toys';
import patternsRoutes from './routes/patterns';
import subscriptionsRoutes from './routes/subscriptions';
import { webhookHandler as subscriptionsWebhookHandler } from './routes/subscriptions';
import payoutsRoutes from './routes/payouts';
import { webhookHandler as payoutsWebhookHandler } from './routes/payouts';
import { roomParticipants } from './roomParticipants';
import { securityHeaders } from './middleware/securityHeaders';
import { indexSchemas, withValidation } from './utils/validation';
export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(securityHeaders);
// Stripe and similar webhooks require raw body for signature verification.
// Register them BEFORE the JSON body parser.
app.post('/payments/webhook', express.raw({ type: 'application/json' }), paymentsWebhookHandler);
app.post(
  '/subscriptions/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionsWebhookHandler,
);
app.post('/payouts/webhook', express.raw({ type: 'application/json' }), payoutsWebhookHandler);
app.use(express.json());
const allowedOrigins =
  (_a = process.env.CORS_ORIGIN) === null || _a === void 0
    ? void 0
    : _a
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
// Preview-safe CORS: if not configured, reflect request origin
app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : true,
  }),
);
const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;
if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.warn('LiveKit credentials not set. Live routes will respond with errors.');
} else {
  console.log('LiveKit API credentials loaded');
}
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/posts', postsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/subscriptions', subscriptionsRoutes);
app.use('/payouts', payoutsRoutes);
app.use('/livekit', livekitRoutes);
app.use('/creators', creatorsRoutes);
app.use('/stream', streamRoutes);
app.use('/gifts', giftsRoutes);
app.use('/rooms', roomsRoutes);
app.use('/moderation', moderationRoutes);
app.use('/control', controlRoutes);
app.use('/toys', toysRoutes);
app.use('/patterns', patternsRoutes);
const port = process.env.PORT || 3001;
const server = createServer(app);
const wss = new WebSocketServer({ server });
const creatorStatus = {};
const callPresence = {};
function broadcastStatus(data) {
  const payload = JSON.stringify(Object.assign({ type: 'creatorStatus' }, data));
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
function broadcastPresence(username, status) {
  const payload = JSON.stringify({ type: 'presence', username, status });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
function broadcastParticipants(room) {
  const participants = roomParticipants[room];
  if (!participants) return;
  const payload = JSON.stringify({
    type: 'roomParticipants',
    room,
    hosts: Array.from(participants.hosts),
    viewers: Array.from(participants.viewers),
  });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
function broadcastRing(to, payload) {
  const msg = JSON.stringify(Object.assign({ type: 'ring', to }, payload));
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}
app.post('/creators/:username/status', withValidation(indexSchemas.creatorStatus), (req, res) => {
  const { username } = req.params;
  const { isLive } = req.body;
  creatorStatus[username] = isLive;
  broadcastStatus({ username, isLive });
  res.json({ ok: true });
});
// Call availability presence (for Calls)
app.post('/presence/:username', (req, res) => {
  var _a;
  const username = String(req.params.username);
  const status = ((_a = req.body) === null || _a === void 0 ? void 0 : _a.status) || 'offline';
  callPresence[username] = status;
  broadcastPresence(username, status);
  res.json({ ok: true });
});
app.get('/presence', (_req, res) => {
  res.json({ presence: callPresence });
});
app.post('/rooms/:room/join', withValidation(indexSchemas.roomJoin), (req, res) => {
  const { room } = req.params;
  const { role, identity } = req.body;
  if (!roomParticipants[room]) {
    roomParticipants[room] = { hosts: new Set(), viewers: new Set() };
  }
  const set = role === 'host' ? roomParticipants[room].hosts : roomParticipants[room].viewers;
  set.add(identity);
  broadcastParticipants(room);
  res.json({ ok: true });
});
app.post('/rooms/:room/leave', withValidation(indexSchemas.roomLeave), (req, res) => {
  const { room } = req.params;
  const { role, identity } = req.body;
  const participants = roomParticipants[room];
  if (participants) {
    const set = role === 'host' ? participants.hosts : participants.viewers;
    set.delete(identity);
    if (participants.hosts.size === 0 && participants.viewers.size === 0) {
      delete roomParticipants[room];
    }
  }
  broadcastParticipants(room);
  res.json({ ok: true });
});
// Simple call invite broadcast (demo-safe)
app.post('/calls/invite', (req, res) => {
  const { to, from, mode = 'video', rate } = req.body || {};
  if (typeof to !== 'string' || typeof from !== 'string') {
    return res.status(400).json({ error: 'to and from required' });
  }
  broadcastRing(to, { from, mode, rate });
  res.json({ ok: true });
});
// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
// Schedule payouts processing only when Stripe and DB are configured (preview-safe)
if (process.env.STRIPE_SECRET_KEY && process.env.DATABASE_URL) {
  (async () => {
    try {
      const { default: cron } = await import('node-cron');
      const mod = await import('./routes/payouts');
      cron.schedule('0 0 * * *', mod.processPendingPayouts);
      console.log('Payouts cron scheduled.');
    } catch (err) {
      console.warn('Skipping payouts cron:', err);
    }
  })();
}
// Handle control session subscriptions over WebSocket
wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(String(raw));
      if (
        (msg === null || msg === void 0 ? void 0 : msg.type) === 'subscribeControl' &&
        typeof msg.sessionId === 'string'
      ) {
        subscribeControl(ws, msg.sessionId);
        ws.send(JSON.stringify({ type: 'subscribed', sessionId: msg.sessionId }));
      } else if (
        (msg === null || msg === void 0 ? void 0 : msg.type) === 'unsubscribeControl' &&
        typeof msg.sessionId === 'string'
      ) {
        unsubscribeControl(ws, msg.sessionId);
        ws.send(JSON.stringify({ type: 'unsubscribed', sessionId: msg.sessionId }));
      }
    } catch (err) {
      // ignore malformed
    }
  });
});
// Lightweight health endpoint for previews
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    features: {
      livekitConfigured: Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET),
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
      dbConfigured: Boolean(process.env.DATABASE_URL),
      supabaseConfigured: Boolean(
        process.env.SUPABASE_URL &&
          (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY),
      ),
    },
  });
});
