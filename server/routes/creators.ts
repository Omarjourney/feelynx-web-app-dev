import { Router } from 'express';
import { prisma } from '../db/prisma';

const router = Router();

// Get all creators
router.get('/', async (_req, res) => {
  try {
    const creators = await prisma.user.findMany({
      select: {
        id: true,
        email: true
      }
    });
    res.json(creators);
  } catch (error) {
    console.error('Failed to fetch creators', error);
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
});

export default router;
