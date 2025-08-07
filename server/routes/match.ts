import { Router } from 'express';
import { prisma } from '../db/prisma';
import { AccessToken } from 'livekit-server-sdk';

const router = Router();

// Fetch next creator based on simple exclusion logic
router.get('/next', async (req, res) => {
  const { userId } = req.query as { userId?: string };
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }
  const id = Number(userId);

  const swiped = await prisma.matchSwipe.findMany({
    where: { swiperId: id },
    select: { swipedId: true }
  });
  const exclude = [id, ...swiped.map((s: any) => s.swipedId)];

  const creator = await prisma.user.findFirst({
    where: { id: { notIn: exclude } },
    select: { id: true, email: true }
  });
  res.json({ creator });
});

// Record a swipe and handle mutual matches
router.post('/swipe', async (req, res) => {
  const { userId, targetId, liked } = req.body as {
    userId?: number;
    targetId?: number;
    liked?: boolean;
  };
  if (!userId || !targetId || typeof liked !== 'boolean') {
    return res.status(400).json({ error: 'userId, targetId and liked are required' });
  }

  const swipe = await prisma.matchSwipe.create({
    data: { swiperId: userId, swipedId: targetId, liked }
  });

  let match = null;
  let token = null;

  if (liked) {
    const reciprocal = await prisma.matchSwipe.findFirst({
      where: { swiperId: targetId, swipedId: userId, liked: true }
    });
    if (reciprocal) {
      const [a, b] = [userId, targetId].sort((x, y) => x - y);
      const roomName = `match_${a}_${b}`;

      if (process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET) {
        const at = new AccessToken(
          process.env.LIVEKIT_API_KEY,
          process.env.LIVEKIT_API_SECRET,
          { identity: String(userId) }
        );
        at.addGrant({ room: roomName, roomJoin: true, canPublish: true, canSubscribe: true });
        token = at.toJwt();
      }

      match = await prisma.match.upsert({
        where: { userAId_userBId: { userAId: a, userBId: b } },
        update: {},
        create: {
          userAId: a,
          userBId: b,
          roomToken: token ?? ''
        }
      });
    }
  }

  res.json({ swipe, match, token });
});

export default router;

