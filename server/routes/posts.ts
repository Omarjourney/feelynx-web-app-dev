import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.send('list posts');
});

router.post('/', (req, res) => {
  res.send('create post');
});

export default router;
