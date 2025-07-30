import { useEffect, useState } from 'react';
import { creators as initialCreators } from '@/data/creators';

export interface Creator {
  id: number;
  name: string;
  username: string;
  country: string;
  age: number;
  tier: string;
  subscribers: string;
  isLive: boolean;
  viewers?: number;
  toyConnected?: string;
  videoRate: number;
  voiceRate: number;
  specialties: string[];
  earnings: string;
  status: string;
  initial: string;
  gradientColors: string;
  isFeatured?: boolean;
}

export function useCreatorLive() {
  const [list, setList] = useState<Creator[]>(initialCreators);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
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
