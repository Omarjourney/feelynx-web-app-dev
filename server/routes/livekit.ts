import { Router } from 'express';
import { AccessToken } from 'livekit-server-sdk';

const router = Router();

router.get('/token', async (req, res) => {
  const room = (req.query.room as string) || 'quickstart';
  const identity = (req.query.identity as string) || Math.random().toString(36).substring(2);

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'LiveKit credentials not set' });
  }

  const at = new AccessToken(apiKey, apiSecret, { identity });
  at.addGrant({ room, roomJoin: true });
  const token = await at.toJwt();
  res.json({ token });
});

export default router;
