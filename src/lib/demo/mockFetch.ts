type Json = Record<string, any> | any[] | string | number | boolean | null;

function jsonResponse(body: Json, init: Partial<ResponseInit> = {}) {
  const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
  return new Response(blob, { status: init.status ?? 200, headers: init.headers as any });
}

export function enableDemoMocks() {
  const store = {
    threads: [] as Array<{ id: string; user1_id: string; user2_id: string; created_at: string }>,
    messages: new Map<string, Array<any>>(),
  };

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url =
        typeof input === 'string' ? new URL(input, location.origin) : new URL(input.toString());
      const { pathname } = url;
      const method = (init?.method || 'GET').toUpperCase();

      // Health
      if (pathname === '/health' && method === 'GET') {
        return jsonResponse({
          ok: true,
          features: {
            livekitConfigured: false,
            stripeConfigured: false,
            dbConfigured: false,
            supabaseConfigured: false,
          },
        });
      }

      // Creators list (demo)
      if ((pathname === '/api/creators' || pathname === '/creators') && method === 'GET') {
        const demo = Array.from({ length: 12 }).map((_, i) => ({
          id: i + 1,
          username: `creator_${i + 1}`,
          name: `Creator ${i + 1}`,
          avatar: `https://source.unsplash.com/random/200x200?sig=${i + 10}`,
          country: 'US',
          specialty: ['Interactive', 'Gaming', 'Music'][i % 3],
          isLive: i % 3 === 0,
          followers: 1000 + i * 37,
        }));
        return jsonResponse(demo);
      }

      // Gifts
      if (pathname === '/gifts/catalog' && method === 'GET') {
        return jsonResponse([
          { id: 1, name: 'Heart', cost: 10 },
          { id: 2, name: 'Star', cost: 25 },
          { id: 3, name: 'Rocket', cost: 50 },
        ]);
      }
      if (pathname === '/gifts/send' && method === 'POST') {
        return jsonResponse({ success: true, balance: 100 });
      }

      // Payments
      if (pathname === '/payments/create-intent' && method === 'POST') {
        return jsonResponse({ clientSecret: 'demo_secret', paymentIntentId: 'pi_demo' });
      }
      if (pathname === '/payments/success' && method === 'POST') {
        return jsonResponse({ success: true, receiptUrl: '#', disputeUrl: '#' });
      }

      // DM threads
      if (pathname === '/dm/threads' && method === 'GET') {
        return jsonResponse(store.threads);
      }
      if (pathname === '/dm/threads' && method === 'POST') {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const id = `t_${Date.now()}`;
        const thread = {
          id,
          user1_id: 'me',
          user2_id: String(body.recipientId || 'user'),
          created_at: new Date().toISOString(),
        };
        store.threads.unshift(thread);
        store.messages.set(id, []);
        return jsonResponse(thread);
      }
      const dmMatch = pathname.match(/^\/dm\/threads\/([^/]+)\/messages$/);
      if (dmMatch && method === 'GET') {
        const id = dmMatch[1];
        return jsonResponse(store.messages.get(id) || []);
      }
      if (dmMatch && method === 'POST') {
        const id = dmMatch[1];
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const msg = {
          id: `m_${Date.now()}`,
          thread_id: id,
          sender_id: 'me',
          recipient_id: String(body.recipientId || 'user'),
          cipher_text: body.cipher_text,
          nonce: body.nonce,
          burn_after_reading: !!body.burnAfterReading,
          read_at: null,
          created_at: new Date().toISOString(),
        };
        const arr = store.messages.get(id) || [];
        arr.push(msg);
        store.messages.set(id, arr);
        return jsonResponse(msg);
      }
      const markRead = pathname.match(/^\/dm\/messages\/([^/]+)\/read$/);
      if (markRead && method === 'POST') {
        return jsonResponse({ read: true });
      }

      // Let everything else go through
      return originalFetch(input, init);
    } catch {
      return originalFetch(input, init);
    }
  };
}
