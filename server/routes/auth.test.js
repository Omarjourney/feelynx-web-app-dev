import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';
const authRouter = (await import('./auth.js')).default;
const { prisma } = await import('../db/prisma.js');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

test('registers a new user and returns token', async () => {
  prisma.user.findUnique = async () => null;
  prisma.user.create = async ({ data }) => ({
    id: 1,
    email: data.email,
    password: data.password,
  });

  const res = await request(app)
    .post('/auth/register')
    .send({ email: 'test@example.com', password: 'secret' });

  assert.equal(res.status, 201);
  assert.ok(res.body.token);
  const payload = jwt.verify(res.body.token, 'secret');
  assert.equal(payload.userId, 1);
});

test('fails to login with wrong password', async () => {
  const hashed = await bcrypt.hash('secret', 10);
  prisma.user.findUnique = async () => ({
    id: 1,
    email: 'test@example.com',
    password: hashed,
  });

  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'test@example.com', password: 'wrong' });

  assert.equal(res.status, 401);
});

test('logs in user and returns token', async () => {
  const hashed = await bcrypt.hash('secret', 10);
  prisma.user.findUnique = async () => ({
    id: 1,
    email: 'test@example.com',
    password: hashed,
  });

  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'test@example.com', password: 'secret' });

  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  const payload = jwt.verify(res.body.token, 'secret');
  assert.equal(payload.userId, 1);
});
