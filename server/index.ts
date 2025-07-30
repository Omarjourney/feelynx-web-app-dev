import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { pool } from './db';

dotenv.config();

const app = express();
app.use(express.json());

import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import postsRoutes from './routes/posts';
import paymentsRoutes from './routes/payments';
import livekitRoutes from './routes/livekit';
import creatorsRoutes from './routes/creators';

app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/posts', postsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/livekit', livekitRoutes);
app.use('/api/creators', creatorsRoutes);

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
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
}

app.post('/creators/:username/status', (req, res) => {
  const { username } = req.params;
  const { isLive } = req.body as { isLive: boolean };
  creatorStatus[username] = isLive;
  broadcastStatus({ username, isLive });
  res.json({ ok: true });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
