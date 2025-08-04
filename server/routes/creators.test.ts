import { describe, it, expect, vi, type Mock } from 'vitest';
import express from 'express';
import type { AddressInfo } from 'node:net';

vi.mock('../db/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn()
    }
  }
}));

import creatorsRouter from './creators';
import { prisma } from '../db/prisma';

describe('GET /creators', () => {
  it('returns creators from the database', async () => {
    const mockCreators = [{ id: 1, email: 'test@example.com' }];
    (prisma.user.findMany as unknown as Mock).mockResolvedValue(mockCreators);

    const app = express();
    app.use('/creators', creatorsRouter);
    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;

    const response = await fetch(`http://127.0.0.1:${port}/creators`);
    const data = await response.json();

    expect(data).toEqual(mockCreators);

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
});

