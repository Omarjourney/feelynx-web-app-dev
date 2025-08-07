import express from 'express';
import { AccessToken } from 'livekit-server-sdk';

const app = express();
app.use(express.json());

// Get credentials from environment variables
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_SERVER_URL = process.env.LIVEKIT_URL;

app.post('/token', (req, res) => {
  const { identity = 'user', room: roomName = 'myRoom' } = req.body as {
    identity?: string;
    room?: string;
  };

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, { identity });
  at.addGrant({ roomJoin: true, room: roomName });

  const token = at.toJwt();
  res.json({ token });
});

app.listen(3000, () => {
  console.log(`Token server running at http://localhost:3000, LiveKit at ${LIVEKIT_SERVER_URL}`);
});
