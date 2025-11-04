import { Router } from 'express';
import { prisma } from '../db/prisma';
import { Room } from 'livekit-client';
import { pkBattleSchemas, withValidation } from '../utils/validation';
const router = Router();
const streams = {};
router.post('/', withValidation(pkBattleSchemas.create), async (req, res) => {
  const { creatorAId, creatorBId, startAt, endAt } = req.body;
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
    res.status(500).json({ error: err.message });
  }
});
router.post('/:battleId/scores', withValidation(pkBattleSchemas.scores), (req, res) => {
  const { battleId } = req.params;
  const { scoreA, scoreB } = req.body;
  const stream = streams[battleId] || { scoreA: 0, scoreB: 0, clients: [] };
  stream.scoreA = scoreA;
  stream.scoreB = scoreB;
  streams[battleId] = stream;
  stream.clients.forEach((client) =>
    client.write(`data: ${JSON.stringify({ scoreA, scoreB })}\n\n`),
  );
  res.json({ ok: true });
});
router.get('/:battleId/stream', withValidation(pkBattleSchemas.stream), (req, res) => {
  var _a;
  const { battleId } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  (_a = res.flushHeaders) === null || _a === void 0 ? void 0 : _a.call(res);
  if (!streams[battleId]) {
    streams[battleId] = { scoreA: 0, scoreB: 0, clients: [] };
  }
  const stream = streams[battleId];
  stream.clients.push(res);
  res.write(`data: ${JSON.stringify({ scoreA: stream.scoreA, scoreB: stream.scoreB })}\n\n`);
  req.on('close', () => {
    stream.clients = stream.clients.filter((c) => c !== res);
  });
});
router.post('/:battleId/connect', withValidation(pkBattleSchemas.connect), async (req, res) => {
  const { battleId } = req.params;
  const { url, token } = req.body;
  const room = new Room();
  try {
    await room.connect(url, token);
    res.json({ connected: true, battleId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    room.disconnect();
  }
});
export default router;
