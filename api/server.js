/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const PORT = Number(process.env.PORT || 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://dev.feelynx.live';

const app = express();

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
