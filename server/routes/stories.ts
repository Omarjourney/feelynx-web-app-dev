import { Router } from 'express';
import cron from 'node-cron';
import { prisma } from '../db/prisma';

const router = Router();

// Cleanup expired stories every hour
cron.schedule('0 * * * *', async () => {
  try {
    await prisma.story.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  } catch (err) {
    console.error('Failed to cleanup stories', err);
  }
});

router.get('/', async (_req, res) => {
  try {
    const stories = await prisma.story.findMany({ orderBy: { expiresAt: 'desc' } });
    res.json(stories);
  } catch (err) {
    console.error('Failed to list stories', err);
    res.status(500).json({ error: 'Failed to list stories' });
  }
});

router.post('/', async (req, res) => {
  const { creatorId, mediaUrl, expiresAt, visibility, tierId } = req.body;
  if (!creatorId || !mediaUrl || !expiresAt || !visibility) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const story = await prisma.story.create({
      data: {
        creatorId,
        mediaUrl,
        expiresAt: new Date(expiresAt),
        visibility,
        tier: tierId ?? null,
      },
    });
    res.json(story);
  } catch (err) {
    console.error('Failed to create story', err);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.story.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete story', err);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

export default router;
