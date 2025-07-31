import { Router } from 'express';

const router = Router();

router.get('/:id', (req, res) => {
  res.send(`get user ${req.params.id}`);
});

router.put('/:id', (req, res) => {
  res.send(`update user ${req.params.id}`);
});

export default router;
