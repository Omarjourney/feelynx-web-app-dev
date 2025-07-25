import { Router } from 'express';
import { AccessToken } from 'livekit-server-sdk';

const router = Router();

const {
  LIVEKIT_URL = 'http://localhost:7880',
  LIVEKIT_API_KEY = 'devkey',
  LIVEKIT_API_SECRET = 'secret',
  RTMP_BASE_URL = 'rtmp://localhost/live',
} = process.env;

// Generate a LiveKit access token for joining a WebRTC room
router.post('/webrtc/token', (req, res) => {
  const { identity, room } = req.body ?? {};
  if (!identity || !room) {
    return res.status(400).json({ error: 'identity and room required' });
  }

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity,
  });
  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

  res.json({ token: at.toJwt(), url: LIVEKIT_URL });
});

// Return an RTMP URL that the client can push to
router.post('/rtmp/start', (_req, res) => {
  const streamKey = Math.random().toString(36).substring(2);
  res.json({ url: `${RTMP_BASE_URL}/${streamKey}` });
});

export default router;
