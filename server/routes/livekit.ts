import { Router } from 'express';
import { AccessToken } from 'livekit-server-sdk';

const router = Router();

router.get('/token', (req, res) => {
  const identity = req.query.identity as string | undefined;
  const room = (req.query.room as string) || 'quickstart';
  if (!identity) {
    return res.status(400).send('identity is required');
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.VITE_LIVEKIT_URL;
  if (!apiKey || !apiSecret || !url) {
    return res.status(500).send('LiveKit credentials not configured');
  }

  const at = new AccessToken(apiKey, apiSecret, { identity });
  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

  const token = at.toJwt();
  res.json({ token, url });
});

export default router;
