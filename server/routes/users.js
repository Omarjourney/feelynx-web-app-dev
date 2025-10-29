import { Router } from 'express';
import { userSchemas, withValidation } from '../utils/validation';
const router = Router();
router.get('/:id', withValidation(userSchemas.getById), (req, res) => {
  const { id } = req.params;
  res.json({ message: `get user ${id}` });
});
router.put('/:id', withValidation(userSchemas.update), (req, res) => {
  const { id } = req.params;
  res.json({ message: `update user ${id}`, changes: req.body });
});
export default router;
