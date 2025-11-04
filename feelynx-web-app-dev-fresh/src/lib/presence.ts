import { useEffect, useState } from 'react';
import { getServerWsUrl } from '@/lib/ws';

export type PresenceStatus = 'available' | 'busy' | 'offline';

export const usePresence = () => {
  const [presence, setPresence] = useState<Record<string, PresenceStatus>>({});

  useEffect(() => {
    let closed = false;
    const ws = new WebSocket(getServerWsUrl());
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(String(ev.data));
        if (
          msg?.type === 'presence' &&
          typeof msg.username === 'string' &&
          typeof msg.status === 'string'
        ) {
          setPresence((curr) => ({ ...curr, [msg.username]: msg.status as PresenceStatus }));
        }
      } catch {
        // ignore
      }
    };
    // bootstrap from HTTP
    fetch('/presence')
      .then((r) => r.json())
      .then((data) => {
        if (!closed && data?.presence) setPresence(data.presence);
      })
      .catch(() => {});
    return () => {
      closed = true;
      ws.close();
    };
  }, []);

  return presence;
};
