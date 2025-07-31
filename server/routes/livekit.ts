import { Router } from 'express';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

const router = Router();

const host = process.env.LIVEKIT_HOST;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

const roomService = host && apiKey && apiSecret ? new RoomServiceClient(host, apiKey, apiSecret) : undefined;

router.get('/token', async (req, res) => {
  const room = (req.query.room as string) || 'quickstart';
  const identity = (req.query.identity as string) || Math.random().toString(36).substring(2);

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'LiveKit credentials not set' });
  }

  const at = new AccessToken(apiKey, apiSecret, { identity });
  at.addGrant({ room, roomJoin: true });
  const token = await at.toJwt();
  res.json({ token });
});

router.post('/rooms', async (req, res) => {
  if (!roomService) {
    return res.status(500).json({ error: 'LiveKit room service not configured' });
  }

  const { name, emptyTimeout, maxParticipants } = req.body as {
    name?: string;
    emptyTimeout?: number;
    maxParticipants?: number;
  };

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  try {
    const room = await roomService.createRoom({ name, emptyTimeout, maxParticipants });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/rooms', async (_req, res) => {
  if (!roomService) {
    return res.status(500).json({ error: 'LiveKit room service not configured' });
  }
  try {
    const rooms = await roomService.listRooms();
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.delete('/rooms/:room', async (req, res) => {
  if (!roomService) {
    return res.status(500).json({ error: 'LiveKit room service not configured' });
  }
  try {
    await roomService.deleteRoom(req.params.room);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
