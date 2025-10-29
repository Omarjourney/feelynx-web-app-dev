import { Router } from 'express';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { supabase } from '../db/supabase';
import { livekitSchemas, withValidation } from '../utils/validation';
const router = Router();
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.LIVEKIT_URL;
let roomService = null;
if (apiKey && apiSecret && wsUrl) {
  roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);
}
// Generate access token for a user to join a room
router.post('/token', withValidation(livekitSchemas.token), async (req, res) => {
  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'LiveKit credentials not configured' });
  }
  const { room, identity } = req.body;
  try {
    const at = new AccessToken(apiKey, apiSecret, { identity });
    at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
    const token = at.toJwt();
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/rooms', withValidation(livekitSchemas.createRoom), async (req, res) => {
  if (!roomService) {
    return res.status(500).json({ error: 'LiveKit room service not configured' });
  }
  const { name, emptyTimeout, maxParticipants } = req.body;
  try {
    const room = await roomService.createRoom({ name, emptyTimeout, maxParticipants });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});
router.delete('/rooms/:room', withValidation(livekitSchemas.deleteRoom), async (req, res) => {
  if (!roomService) {
    return res.status(500).json({ error: 'LiveKit room service not configured' });
  }
  try {
    const { room } = req.params;
    await roomService.deleteRoom(room);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// LiveKit webhook endpoint for analytics
router.post('/webhook', withValidation(livekitSchemas.webhook), async (req, res) => {
  var _a, _b, _c;
  const event = req.body;
  try {
    switch (event.event) {
      case 'participant_joined':
        await supabase.from('audience_retention').insert({
          stream_id: (_a = event.room) === null || _a === void 0 ? void 0 : _a.name,
          participant_identity:
            (_b = event.participant) === null || _b === void 0 ? void 0 : _b.identity,
          joined_at: new Date().toISOString(),
        });
        break;
      case 'room_finished':
        await supabase.from('stream_stats').insert({
          stream_id: (_c = event.room) === null || _c === void 0 ? void 0 : _c.name,
          ended_at: new Date().toISOString(),
        });
        break;
      default:
        break;
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;
