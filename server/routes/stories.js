import { Router } from 'express';
import cron from 'node-cron';
import { prisma } from '../db/prisma';
import { storySchemas, withValidation } from '../utils/validation';
const router = Router();
// Cleanup expired stories every hour
cron.schedule('0 * * * *', async () => {
  try {
    await prisma.story.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  } catch (err) {
    console.error('Failed to cleanup stories', err);
  }
});
router.get('/', withValidation(storySchemas.list), async (_req, res) => {
  try {
    const stories = await prisma.story.findMany({ orderBy: { expiresAt: 'desc' } });
    res.json(stories);
  } catch (err) {
    console.error('Failed to list stories', err);
    res.status(500).json({ error: 'Failed to list stories' });
  }
});
router.post('/', withValidation(storySchemas.create), async (req, res) => {
  const { creatorId, mediaUrl, expiresAt, visibility, tierId } = req.body;
  try {
    const story = await prisma.story.create({
      data: {
        creatorId,
        mediaUrl,
        expiresAt: new Date(expiresAt),
        visibility,
        tier: tierId !== null && tierId !== void 0 ? tierId : null,
      },
    });
    res.json(story);
  } catch (err) {
    console.error('Failed to create story', err);
    res.status(500).json({ error: 'Failed to create story' });
  }
});
router.delete('/:id', withValidation(storySchemas.remove), async (req, res) => {
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
