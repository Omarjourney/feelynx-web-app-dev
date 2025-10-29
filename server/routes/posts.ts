import { Router } from 'express';
import { postSchemas, withValidation, type InferBody } from '../utils/validation';

const router = Router();

router.get('/', withValidation(postSchemas.list), (req, res) => {
  res.json({ message: 'list posts', filters: req.query });
});

router.post('/', withValidation(postSchemas.create), (req, res) => {
  const { title, content } = req.body as InferBody<typeof postSchemas.create>;
  res.json({ message: 'create post', title, content });
});

export default router;
