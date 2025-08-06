import express from 'express';
import { AccessToken } from 'livekit-server-sdk';

const app = express();

// === Replace these placeholders with your real values ===
const LIVEKIT_API_KEY = 'APIBaMPjQuhffX7';
const LIVEKIT_API_SECRET = 'X8NfiffKnxGzH63qsT6I9RMkDsBcS8JlJAesTUK44M2B';
const LIVEKIT_SERVER_URL = 'wss://feelynxlive-rtnczet2.livekit.cloud';

app.get('/token', (req, res) => {
  const identity = req.query.identity || 'user';
  const roomName = req.query.room || 'myRoom';

  // Generate a token for the specified user and room
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, { identity });
  at.addGrant({ roomJoin: true, room: roomName });

  const token = at.toJwt();
  res.send(token);
});

app.listen(3000, () => {
  console.log(`Token server running at http://localhost:3000, LiveKit at ${LIVEKIT_SERVER_URL}`);
});
