import { Router } from 'express';

const router = Router();

// Get all creators
router.get('/', async (req, res) => {
  try {
    // TODO: Replace with actual database query
    const creators = [
      { id: 1, username: 'creator1', name: 'Creator One', isLive: false },
      { id: 2, username: 'creator2', name: 'Creator Two', isLive: true }
    ];
    res.json(creators);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
});

export default router;