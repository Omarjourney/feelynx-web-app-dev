import { Router } from 'express';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { supabase } from '../db/supabase';

const router = Router();

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.LIVEKIT_URL;

let roomService: RoomServiceClient | null = null;

if (apiKey && apiSecret && wsUrl) {
  roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);
}

// Generate access token for a user to join a room
router.post('/token', async (req, res) => {
  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'LiveKit credentials not configured' });
  }

  const { room, identity } = req.body as { room?: string; identity?: string };
  
  if (!room || !identity) {
    return res.status(400).json({ error: 'room and identity are required' });
  }

  try {
    const at = new AccessToken(apiKey, apiSecret, { identity });
    at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

    const token = at.toJwt();
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
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

// LiveKit webhook endpoint for analytics
router.post('/webhook', async (req, res) => {
  const event = req.body as { event?: string; room?: { name?: string; }; participant?: { identity?: string } };

  if (!event.event) {
    return res.status(400).json({ error: 'invalid webhook payload' });
  }

  try {
    switch (event.event) {
      case 'participant_joined':
        await supabase.from('audience_retention').insert({
          stream_id: event.room?.name,
          participant_identity: event.participant?.identity,
          joined_at: new Date().toISOString()
        });
        break;
      case 'room_finished':
        await supabase.from('stream_stats').insert({
          stream_id: event.room?.name,
          ended_at: new Date().toISOString()
        });
        break;
      default:
        break;
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
