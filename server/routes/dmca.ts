import { Router } from 'express';
import { prisma } from '../db/prisma';

const router = Router();

async function sendEmail(to: string, subject: string, body: string) {
  // Placeholder for real email integration
  console.log(`Email to ${to}: ${subject} - ${body}`);
}

router.post('/', async (req, res) => {
  const { reporterName, reporterEmail, contentLink } = req.body as {
    reporterName: string;
    reporterEmail: string;
    contentLink: string;
  };
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

router.get('/', async (_req, res) => {
  try {
    const notices = await prisma.dmcaNotice.findMany();
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

router.post('/:id/resolve', async (req, res) => {
  const { id } = req.params;
  const { status, resolution } = req.body as {
    status: string;
    resolution: string;
  };
  try {
    const notice = await prisma.dmcaNotice.update({
      where: { id: Number(id) },
      data: { status, resolution },
    });
    await sendEmail(notice.reporterEmail, 'DMCA Notice Update', `Your notice status: ${status}`);
    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve notice' });
  }
});

export default router;
