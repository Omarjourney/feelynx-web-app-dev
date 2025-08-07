import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { Room } from 'livekit-client';

const router = Router();

interface BattleStream {
  scoreA: number;
  scoreB: number;
  clients: Response[];
}

const streams: Record<number, BattleStream> = {};

router.post('/', async (req: Request, res: Response) => {
  const { creatorAId, creatorBId, startAt, endAt } = req.body as {
    creatorAId: number;
    creatorBId: number;
    startAt: string;
    endAt?: string;
  };

  try {
    const battle = await prisma.pKBattle.create({
      data: {
        creatorAId,
        creatorBId,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        status: 'pending'
      }
    });
    streams[battle.id] = { scoreA: 0, scoreB: 0, clients: [] };
    res.json(battle);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/:battleId/scores', (req: Request, res: Response) => {
  const id = Number(req.params.battleId);
  const { scoreA, scoreB } = req.body as { scoreA: number; scoreB: number };
  const stream = streams[id] || { scoreA: 0, scoreB: 0, clients: [] };
  stream.scoreA = scoreA;
  stream.scoreB = scoreB;
  streams[id] = stream;
  stream.clients.forEach((client) =>
    client.write(`data: ${JSON.stringify({ scoreA, scoreB })}\n\n`)
  );
  res.json({ ok: true });
});

router.get('/:battleId/stream', (req: Request, res: Response) => {
  const id = Number(req.params.battleId);
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  if (!streams[id]) {
    streams[id] = { scoreA: 0, scoreB: 0, clients: [] };
  }
  const stream = streams[id];
  stream.clients.push(res);
  res.write(`data: ${JSON.stringify({ scoreA: stream.scoreA, scoreB: stream.scoreB })}\n\n`);

  req.on('close', () => {
    stream.clients = stream.clients.filter((c) => c !== res);
  });
});

router.post('/:battleId/connect', async (req: Request, res: Response) => {
  const { url, token } = req.body as { url: string; token: string };
  const room = new Room();
  try {
    await room.connect(url, token);
    res.json({ connected: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  } finally {
    room.disconnect();
  }
});

export default router;
