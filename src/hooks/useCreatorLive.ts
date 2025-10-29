import { useEffect, useState } from 'react';
import { creators as initialCreators } from '@/data/creators';
import type { Creator } from '@/types/creator';
import { getServerWsUrl } from '@/lib/ws';

/**
 * Tracks the live status of creators by subscribing to the websocket stream
 * exposed by the backend. The connection URL is taken from `VITE_WS_URL` and
 * defaults to a local development endpoint.
 *
 * The hook keeps the latest list of creators in sync with `creatorStatus`
 * messages pushed by the server and tears down the websocket when the
 * component unmounts.
 *
 * @returns The list of creators with live state that updates in real time.
 */
export function useCreatorLive() {
  const [list, setList] = useState<Creator[]>(initialCreators);

  useEffect(() => {
    // Subscribe to backend websocket updates to keep live status in sync.
    // Prefer VITE_SERVER_WS_URL when provided; otherwise infer from location
    const envUrl = (import.meta as any).env?.VITE_SERVER_WS_URL as string | undefined;
    let url = envUrl || getServerWsUrl();
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      url.startsWith('ws://')
    ) {
      url = url.replace(/^ws:/, 'wss:');
    }
    const ws = new WebSocket(url);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'creatorStatus') {
          setList((curr) =>
            curr.map((c) => (c.username === msg.username ? { ...c, isLive: msg.isLive } : c)),
          );
        }
      } catch (err) {
        console.error('ws message error', err);
      }
    };

    return () => ws.close();
  }, []);

  return list;
}
