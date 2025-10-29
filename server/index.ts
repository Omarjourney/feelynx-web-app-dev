import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { subscribe as subscribeControl, unsubscribe as unsubscribeControl } from './wsControl';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import postsRoutes from './routes/posts';
import paymentsRoutes, { webhookHandler as stripeWebhookHandler } from './routes/payments';
import livekitRoutes from './routes/livekit';
import creatorsRoutes from './routes/creators';
import streamRoutes from './routes/stream';
import giftsRoutes from './routes/gifts';
import roomsRoutes from './routes/rooms';
import moderationRoutes from './routes/moderation';
import controlRoutes from './routes/control';
import { roomParticipants } from './roomParticipants';
import { securityHeaders } from './middleware/securityHeaders';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(securityHeaders);

app.use(express.json());
const allowedOrigins = process.env.CORS_ORIGIN?.split(',')
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
app.use('/livekit', livekitRoutes);
app.use('/creators', creatorsRoutes);
app.use('/stream', streamRoutes);
app.use('/gifts', giftsRoutes);
app.use('/rooms', roomsRoutes);
app.use('/moderation', moderationRoutes);
app.use('/control', controlRoutes);

const port = process.env.PORT || 3001;

const server = createServer(app);
const wss = new WebSocketServer({ server });

interface StatusMessage {
  username: string;
  isLive: boolean;
}

const creatorStatus: Record<string, boolean> = {};

function broadcastStatus(data: StatusMessage) {
  const payload = JSON.stringify({ type: 'creatorStatus', ...data });
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function broadcastParticipants(room: string) {
  const participants = roomParticipants[room];
  if (!participants) return;
  const payload = JSON.stringify({
    type: 'roomParticipants',
    room,
    hosts: Array.from(participants.hosts),
    viewers: Array.from(participants.viewers),
  });
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

app.post('/creators/:username/status', (req: Request, res: Response) => {
  const { username } = req.params;
  const { isLive } = req.body as { isLive: boolean };
  creatorStatus[username] = isLive;
  broadcastStatus({ username, isLive });
  res.json({ ok: true });
});

app.post('/rooms/:room/join', (req: Request, res: Response) => {
  const { room } = req.params;
  const { role, identity } = req.body as { role: 'host' | 'viewer'; identity: string };
  if (!roomParticipants[room]) {
    roomParticipants[room] = { hosts: new Set(), viewers: new Set() };
  }
  const set = role === 'host' ? roomParticipants[room].hosts : roomParticipants[room].viewers;
  set.add(identity);
  broadcastParticipants(room);
  res.json({ ok: true });
});

app.post('/rooms/:room/leave', (req: Request, res: Response) => {
  const { room } = req.params;
  const { role, identity } = req.body as { role: 'host' | 'viewer'; identity: string };
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

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Schedule payouts processing only when Stripe and DB are configured (preview-safe)
if (process.env.STRIPE_SECRET_KEY && process.env.DATABASE_URL) {
  // Dynamically import to avoid loading modules that require secrets in preview environments
  (async () => {
    try {
      const cron = await import('node-cron');
      const mod = await import('./routes/payouts');
      cron.schedule('0 0 * * *', mod.processPendingPayouts);
      console.log('Payouts cron scheduled.');
    } catch (err) {
      console.warn('Skipping payouts cron:', err);
    }
  })();
}

// Handle control session subscriptions over WebSocket
wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(String(raw));
      if (msg?.type === 'subscribeControl' && typeof msg.sessionId === 'string') {
        subscribeControl(ws, msg.sessionId);
        ws.send(JSON.stringify({ type: 'subscribed', sessionId: msg.sessionId }));
      } else if (msg?.type === 'unsubscribeControl' && typeof msg.sessionId === 'string') {
        unsubscribeControl(ws, msg.sessionId);
        ws.send(JSON.stringify({ type: 'unsubscribed', sessionId: msg.sessionId }));
      }
    } catch (err) {
      // ignore malformed
    }
  });
});

// Lightweight health endpoint for previews
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    features: {
      livekitConfigured: Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET),
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
      dbConfigured: Boolean(process.env.DATABASE_URL),
    },
  });
});
