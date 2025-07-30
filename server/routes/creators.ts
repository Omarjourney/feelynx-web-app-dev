import { Router } from 'express';
import { prisma } from '../db/prisma';
import { creators as mockCreators } from '../../src/data/creators';

const router = Router();

// List creators
router.get('/', async (req, res) => {
  try {
    if (process.env.USE_PRISMA_CREATORS) {
      const creators = await prisma.creator.findMany();
      return res.json(creators);
    }
    return res.json(mockCreators);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
});

// Add a creator (simplified)
router.post('/', async (req, res) => {
  try {
    if (process.env.USE_PRISMA_CREATORS) {
      const creator = await prisma.creator.create({ data: req.body });
      return res.json(creator);
    }
    mockCreators.push(req.body);
    res.json(req.body);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add creator' });
  }
});

export default router;
