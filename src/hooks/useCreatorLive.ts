import { useEffect, useState } from 'react';
import { fetchCreators } from '@/data/creators';
import type { Creator } from '@/types/creator';
import { getServerWsUrl } from '@/lib/ws';
import { toast } from '@/hooks/use-toast';
import { getUserMessage } from '@/lib/errors';

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
const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

export function useCreatorLive() {
  const [list, setList] = useState<Creator[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCreators({}, controller.signal)
      .then((creators) => {
        setList(creators);
      })
      .catch((error) => {
        if (isAbortError(error)) return;
        toast({
          title: 'Unable to load creators',
          description: getUserMessage(error),
          variant: 'destructive',
        });
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
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
    let notifiedError = false;

    ws.onmessage = (event) => {
      try {
        if (typeof event.data !== 'string') return;
        const msg = JSON.parse(event.data);
        if (msg?.type === 'creatorStatus' && typeof msg.username === 'string') {
          setList((curr) => {
            const next = curr.map((creator) =>
              creator.username === msg.username
                ? { ...creator, isLive: Boolean(msg.isLive), viewers: msg.viewers ?? creator.viewers }
                : creator,
            );
            return next;
          });
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => {
      if (notifiedError) return;
      notifiedError = true;
      toast({
        title: 'Live updates unavailable',
        description: 'We could not subscribe to live creator updates right now.',
        variant: 'destructive',
      });
    };

    return () => {
      ws.close();
    };
  }, []);

  return list;
}
