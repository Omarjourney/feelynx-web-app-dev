import { Router } from 'express';
import { prisma } from '../db/prisma';
import { RoomServiceClient, DataPacket_Kind } from 'livekit-server-sdk';
import { gameSchemas, type InferBody, type InferParams, withValidation } from '../utils/validation';

const router = Router();

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.LIVEKIT_URL;

let roomService: RoomServiceClient | null = null;

if (apiKey && apiSecret && wsUrl) {
  roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);
}

// simple in-memory wallet balances
const wallets: Record<number, number> = {};

// Start a game session and notify room participants
router.post('/start', withValidation(gameSchemas.start), async (req, res) => {
  if (!roomService) {
    return res.status(500).json({ error: 'LiveKit room service not configured' });
  }

  const { gameId, room } = req.body as InferBody<typeof gameSchemas.start>;

  try {
    const session = await prisma.gameSession.create({ data: { gameId, room } });
    await roomService.sendData(
      room,
      Buffer.from(JSON.stringify({ type: 'game-start', sessionId: session.id })),
      DataPacket_Kind.RELIABLE,
    );
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// End a game session, reward the winner, and notify participants
router.post('/:id/end', withValidation(gameSchemas.end), async (req, res) => {
  if (!roomService) {
    return res.status(500).json({ error: 'LiveKit room service not configured' });
  }

  const { id } = req.params as InferParams<typeof gameSchemas.end>;
  const { winnerId, reward } = req.body as InferBody<typeof gameSchemas.end>;

  try {
    const session = await prisma.gameSession.update({
      where: { id },
      data: { endedAt: new Date() },
    });

    let balance: number | undefined;
    if (winnerId && reward) {
      balance = wallets[winnerId] = (wallets[winnerId] || 0) + reward;
    }

    await roomService.sendData(
      session.room,
      Buffer.from(
        JSON.stringify({
          type: 'game-end',
          sessionId: id,
          winnerId,
          reward,
        }),
      ),
      DataPacket_Kind.RELIABLE,
    );

    res.json({ session, balance });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Retrieve wallet balance for a user
router.get('/wallet/:userId', withValidation(gameSchemas.wallet), (req, res) => {
  const { userId } = req.params as InferParams<typeof gameSchemas.wallet>;
  res.json({ balance: wallets[userId] || 0 });
});

export default router;
