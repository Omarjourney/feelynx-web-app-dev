import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma.js';
import { authSchemas, withValidation } from '../utils/validation';
const router = Router();
const RAW_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = RAW_SECRET || (process.env.NODE_ENV === 'test' ? 'secret' : '');
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const generateToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (_a) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
router.post('/register', withValidation(authSchemas.register), async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed } });
    const token = generateToken(user.id);
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.post('/login', withValidation(authSchemas.login), async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user.id);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: user.id, email: user.email });
  } catch (_a) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
export default router;
