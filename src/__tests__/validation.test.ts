import request from 'supertest';
import { describe, expect, it } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-role-key';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'service-key';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_key';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
process.env.LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || 'livekit_key';
process.env.LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || 'livekit_secret';
process.env.LIVEKIT_URL = process.env.LIVEKIT_URL || 'https://example.com';

import { app } from '../../server/index';

describe('request validation middleware', () => {
  it('rejects malformed auth registration payloads', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'short' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('ValidationError');
    expect(response.body.details).toBeInstanceOf(Array);
  });

  it('rejects invalid payment intent payloads', async () => {
    const response = await request(app)
      .post('/payments/create-intent')
      .send({ amount: -10, coins: 0, userId: null });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('ValidationError');
  });

  it('rejects moderation reports with missing fields', async () => {
    const response = await request(app).post('/moderation/report').send({ reportedId: 1 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('ValidationError');
  });

  it('rejects room participation payloads with unsupported roles', async () => {
    const response = await request(app)
      .post('/rooms/sample-room/join')
      .send({ role: 'guest', identity: 'user!@#' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('ValidationError');
  });
});
