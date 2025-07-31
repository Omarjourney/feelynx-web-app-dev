import { useEffect, useState } from 'react';
import { creators as initialCreators } from '@/data/creators';
import type { Creator } from '@/types/creator';

export function useCreatorLive() {
  const [list, setList] = useState<Creator[]>(initialCreators);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(wsUrl);
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
