import { Router } from 'express';
import { prisma } from '../db/prisma';
import { moderationSchemas, withValidation } from '../utils/validation';
const router = Router();
async function scanContent(content) {
  if (!process.env.HIVE_API_KEY) return { flagged: false };
  try {
    const res = await fetch('https://api.thehive.ai/api/v1/scan', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.HIVE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
    return await res.json();
  } catch (err) {
    console.error('AI moderation failed', err);
    return { error: 'scan_failed' };
  }
}
router.post('/report', withValidation(moderationSchemas.report), async (req, res) => {
  const { reportedId, type, reason } = req.body;
  const scan = await scanContent(reason);
  const report = await prisma.report.create({
    data: { reportedId, type, reason, status: 'pending' },
  });
  res.json({ report, scan });
});
router.get('/reports', async (_req, res) => {
  const reports = await prisma.report.findMany({ where: { status: 'pending' } });
  res.json(reports);
});
router.post('/actions', withValidation(moderationSchemas.actions), async (req, res) => {
  const { reportId, action, moderatorId } = req.body;
  const record = await prisma.moderationAction.create({ data: { reportId, action, moderatorId } });
  await prisma.report.update({ where: { id: reportId }, data: { status: 'resolved' } });
  if (action === 'ban') {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (report) {
      await prisma.bannedUser.create({
        data: { userId: report.reportedId, reason: report.reason },
      });
    }
  }
  res.json(record);
});
export default router;
