import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma.js';
import {
  authSchemas,
  type AuthLoginBody,
  type AuthRegisterBody,
  withValidation,
} from '../utils/validation';

const router = Router();
const RAW_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = RAW_SECRET || (process.env.NODE_ENV === 'test' ? 'secret' : '');
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

interface AuthRequest extends Request {
  userId?: number;
}

const GUEST_USER_ID = 0;

const generateToken = (userId: number) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

export const authenticateToken = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.userId = GUEST_USER_ID;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = payload.userId;
  } catch {
    req.userId = GUEST_USER_ID;
  }

  next();
};

router.post(
  '/register',
  withValidation(authSchemas.register),
  async (req: Request, res: Response) => {
    const { email, password } = req.body as AuthRegisterBody;
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
  },
);

router.post('/login', withValidation(authSchemas.login), async (req: Request, res: Response) => {
  const { email, password } = req.body as AuthLoginBody;
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

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: user.id, email: user.email });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
