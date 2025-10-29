import { Router } from 'express';
import { prisma } from '../db/prisma';
import { privacySchemas, withValidation } from '../utils/validation';
const router = Router();
router.get('/:userId', withValidation(privacySchemas.get), async (req, res) => {
  const { userId } = req.params;
  try {
    const settings = await prisma.privacySettings.findUnique({
      where: { userId },
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'failed to load settings' });
  }
});
router.post('/:userId', withValidation(privacySchemas.set), async (req, res) => {
  const { userId } = req.params;
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
function scheduleDeletion(userId, days) {
  const ms = days * 24 * 60 * 60 * 1000;
  setTimeout(async () => {
    try {
      await prisma.post.deleteMany({ where: { userId } });
    } catch (_a) {
      /* ignore errors during cleanup */
    }
  }, ms);
}
export default router;
