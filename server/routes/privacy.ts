import { Router } from 'express';
import { prisma } from '../db/prisma';

const router = Router();

router.get('/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  try {
    const settings = await prisma.privacySettings.findUnique({
      where: { userId },
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'failed to load settings' });
  }
});

router.post('/:userId', async (req, res) => {
  const userId = Number(req.params.userId);
  const { profileVisibility, allowDMs, dataRetentionDays } = req.body;
  try {
    const settings = await prisma.privacySettings.upsert({
      where: { userId },
      update: { profileVisibility, allowDMs, dataRetentionDays },
      create: { userId, profileVisibility, allowDMs, dataRetentionDays },
    });
    scheduleDeletion(userId, dataRetentionDays);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'failed to update settings' });
  }
});

function scheduleDeletion(userId: number, days: number) {
  const ms = days * 24 * 60 * 60 * 1000;
  setTimeout(async () => {
    try {
      await prisma.post.deleteMany({ where: { userId } });
    } catch {
      /* ignore errors during cleanup */
    }
  }, ms);
}

export default router;
