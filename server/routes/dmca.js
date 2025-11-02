import { Router } from 'express';
import { prisma } from '../db/prisma';
import { dmcaSchemas, withValidation } from '../utils/validation';
const router = Router();
async function sendEmail(to, subject, body) {
  // Placeholder for real email integration
  console.log(`Email to ${to}: ${subject} - ${body}`);
}
router.post('/', withValidation(dmcaSchemas.create), async (req, res) => {
  const { reporterName, reporterEmail, contentLink } = req.body;
  try {
    const notice = await prisma.dmcaNotice.create({
      data: { reporterName, reporterEmail, contentLink },
    });
    await sendEmail('admin@example.com', 'New DMCA Notice', `Notice ${notice.id}`);
    await sendEmail(reporterEmail, 'DMCA Notice Received', 'We have received your DMCA notice.');
    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit notice' });
  }
});
router.get('/', withValidation(dmcaSchemas.list), async (_req, res) => {
  try {
    const notices = await prisma.dmcaNotice.findMany();
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});
router.post('/:id/resolve', withValidation(dmcaSchemas.resolve), async (req, res) => {
  const { id } = req.params;
  const { status, resolution } = req.body;
  try {
    const notice = await prisma.dmcaNotice.update({
      where: { id },
      data: { status, resolution },
    });
    await sendEmail(notice.reporterEmail, 'DMCA Notice Update', `Your notice status: ${status}`);
    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve notice' });
  }
});
export default router;
