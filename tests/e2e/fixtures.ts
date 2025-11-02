import { test as base, expect } from '@playwright/test';
import type { Route } from '@playwright/test';

const SUPABASE_URL = 'https://hnvsvbnxlaeqtezlonmu.supabase.co';

const createSessionPayload = () => {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  return {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: expiresAt,
    user: {
      id: 'test-user-id',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'test-user@example.com',
      email_confirmed_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: { provider: 'email' },
      user_metadata: { display_name: 'Test User' },
      identities: [],
      factors: [],
      phone: null,
      phone_confirmed_at: null,
      recovery_sent_at: null,
      confirmation_sent_at: null,
      email_change_sent_at: null,
      invited_at: null,
      new_email: null,
      new_phone: null,
      last_sign_in_ip: '127.0.0.1',
      is_super_admin: null,
    },
  };
};

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export const test = base.extend({
  page: async ({ page }, run) => {
    await page.addInitScript(() => {
      class MockWebSocket {
        static CONNECTING = 0;
        static OPEN = 1;
        static CLOSING = 2;
        static CLOSED = 3;
        readyState = MockWebSocket.OPEN;
        url: string;
        onopen: ((event: { target: MockWebSocket }) => void) | null = null;
        onmessage: ((event: { data: string }) => void) | null = null;
        onerror: ((event: Event) => void) | null = null;
        onclose: ((event: CloseEvent) => void) | null = null;

        constructor(url: string) {
          this.url = url;
          setTimeout(() => {
            this.onopen?.({ target: this });
          }, 0);
        }

        send(_data: string) {
          // no-op for tests
        }

        close() {
          this.readyState = MockWebSocket.CLOSED;
          this.onclose?.({} as CloseEvent);
        }
      }

      // @ts-expect-error override read-only for tests
      window.WebSocket = MockWebSocket;
    });

    await page.route(`${SUPABASE_URL}/auth/v1/*`, async (route) => {
      const request = route.request();
      const method = request.method();
      const url = request.url();

      if (method === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
        return;
      }

      const target = new URL(url);
      const path = target.pathname;
      if (path.endsWith('/token')) {
        const grantType = target.searchParams.get('grant_type');
        if (grantType === 'password' || grantType === 'refresh_token') {
          await fulfillJson(route, createSessionPayload());
          return;
        }
      }

      if (path.endsWith('/signup')) {
        await fulfillJson(route, { user: createSessionPayload().user, session: null });
        return;
      }

      if (path.endsWith('/user')) {
        await fulfillJson(route, createSessionPayload().user);
        return;
      }

      if (path.endsWith('/logout')) {
        await route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
        return;
      }

      await fulfillJson(route, {});
    });

    await run(page);
  },
});

export { expect } from '@playwright/test';
