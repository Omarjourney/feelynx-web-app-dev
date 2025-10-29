import { Router, Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { Room } from 'livekit-client';
import {
  pkBattleSchemas,
  type InferBody,
  type InferParams,
  withValidation,
} from '../utils/validation';

const router = Router();

interface BattleStream {
  scoreA: number;
  scoreB: number;
  clients: Response[];
}

const streams: Record<number, BattleStream> = {};

router.post('/', withValidation(pkBattleSchemas.create), async (req: Request, res: Response) => {
  const { creatorAId, creatorBId, startAt, endAt } = req.body as InferBody<
    typeof pkBattleSchemas.create
  >;

  try {
    const battle = await prisma.pKBattle.create({
      data: {
        creatorAId,
        creatorBId,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        status: 'pending',
      },
    });
    streams[battle.id] = { scoreA: 0, scoreB: 0, clients: [] };
    res.json(battle);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post(
  '/:battleId/scores',
  withValidation(pkBattleSchemas.scores),
  (req: Request, res: Response) => {
    const { battleId } = req.params as unknown as InferParams<typeof pkBattleSchemas.scores>;
    const { scoreA, scoreB } = req.body as InferBody<typeof pkBattleSchemas.scores>;
    const stream = streams[battleId] || { scoreA: 0, scoreB: 0, clients: [] };
    stream.scoreA = scoreA;
    stream.scoreB = scoreB;
    streams[battleId] = stream;
    stream.clients.forEach((client) =>
      client.write(`data: ${JSON.stringify({ scoreA, scoreB })}\n\n`),
    );
    res.json({ ok: true });
  },
);

router.get(
  '/:battleId/stream',
  withValidation(pkBattleSchemas.stream),
  (req: Request, res: Response) => {
    const { battleId } = req.params as unknown as InferParams<typeof pkBattleSchemas.stream>;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    if (!streams[battleId]) {
      streams[battleId] = { scoreA: 0, scoreB: 0, clients: [] };
    }
    const stream = streams[battleId];
    stream.clients.push(res);
    res.write(`data: ${JSON.stringify({ scoreA: stream.scoreA, scoreB: stream.scoreB })}\n\n`);

    req.on('close', () => {
      stream.clients = stream.clients.filter((c) => c !== res);
    });
  },
);

router.post(
  '/:battleId/connect',
  withValidation(pkBattleSchemas.connect),
  async (req: Request, res: Response) => {
    const { battleId } = req.params as unknown as InferParams<typeof pkBattleSchemas.connect>;
    const { url, token } = req.body as InferBody<typeof pkBattleSchemas.connect>;
    const room = new Room();
    try {
      await room.connect(url, token);
      res.json({ connected: true, battleId });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    } finally {
      room.disconnect();
    }
  },
);

export default router;
