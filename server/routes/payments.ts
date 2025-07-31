import { Router } from 'express';

const router = Router();

router.post('/charge', (req, res) => {
  res.send('charge payment');
});

export default router;
