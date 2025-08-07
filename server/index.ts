import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import postsRoutes from './routes/posts';
import paymentsRoutes from './routes/payments';
import livekitRoutes from './routes/livekit';
import creatorsRoutes from './routes/creators';
import streamRoutes from './routes/stream';
import giftsRoutes from './routes/gifts';
import roomsRoutes from './routes/rooms';
import { roomParticipants } from './roomParticipants';

const app = express();
app.use(express.json());
const allowedOrigins = process.env.CORS_ORIGIN?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (
  process.env.NODE_ENV === 'production' &&
  (!allowedOrigins || allowedOrigins.length === 0 || allowedOrigins.includes('*'))
) {
  console.error(
    'CORS_ORIGIN must include every front-end URL in production'
  );
  process.exit(1);
}

app.use(
  cors({
    origin: allowedOrigins
  })
);

const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET } = process.env;
if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.error('LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set');
  process.exit(1);
}
console.log('LiveKit API credentials loaded');


app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/posts', postsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/livekit', livekitRoutes);
app.use('/creators', creatorsRoutes);
app.use('/stream', streamRoutes);
app.use('/gifts', giftsRoutes);
app.use('/rooms', roomsRoutes);


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
    viewers: Array.from(participants.viewers)
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
