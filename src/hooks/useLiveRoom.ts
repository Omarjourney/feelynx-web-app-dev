import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  LiveMessage,
  LiveMessageInput,
  useLiveStore,
} from '@/state/liveStore';

const VIEWER_DEBOUNCE_MS = 200;

const encodeFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

type ConnectionState = 'idle' | 'connecting' | 'open' | 'closing' | 'closed' | 'error';

type UseLiveRoomOptions = {
  roomId?: string | null;
  enabled?: boolean;
};

type LiveRoomApi = {
  connectionState: ConnectionState;
  sendChatMessage: (message: LiveMessageInput) => Promise<void>;
  sendReaction: (emoji: string) => void;
  setTyping: (typing: boolean) => void;
};

export function useLiveRoom({ roomId, enabled = true }: UseLiveRoomOptions): LiveRoomApi {
  const setViewerCount = useLiveStore((state) => state.setViewerCount);
  const addTokens = useLiveStore((state) => state.addTokens);
  const addMessage = useLiveStore((state) => state.addMessage);
  const setTypingUsers = useLiveStore((state) => state.setTypingUsers);
  const setError = useLiveStore((state) => state.setError);

  const wsRef = useRef<WebSocket | null>(null);
  const viewerCountRef = useRef<number | null>(null);
  const viewerTimerRef = useRef<number | undefined>(undefined);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const typingTimeoutRef = useRef<number | undefined>(undefined);

  const clearViewerTimer = () => {
    if (viewerTimerRef.current !== undefined) {
      window.clearTimeout(viewerTimerRef.current);
      viewerTimerRef.current = undefined;
    }
  };

  const flushViewerCount = useCallback(() => {
    if (viewerCountRef.current !== null) {
      setViewerCount(viewerCountRef.current);
      viewerCountRef.current = null;
    }
    clearViewerTimer();
  }, [setViewerCount]);

  useEffect(() => {
    if (!roomId || !enabled) {
      setConnectionState('idle');
      return () => undefined;
    }

    const envUrl = (import.meta as any).env?.VITE_WS_URL as string | undefined;
    if (!envUrl) {
      setError('Live updates are unavailable: VITE_WS_URL is not configured.');
      setConnectionState('error');
      return () => undefined;
    }

    let url = `${envUrl.replace(/\/$/, '')}/live/${encodeURIComponent(roomId)}`;
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      url.startsWith('ws://')
    ) {
      url = url.replace(/^ws:/, 'wss:');
    }

    setConnectionState('connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionState('open');
      setError(null);
    };

    ws.onclose = () => {
      setConnectionState('closed');
      flushViewerCount();
      wsRef.current = null;
    };

    ws.onerror = () => {
      setConnectionState('error');
      setError('Connection to the live room failed.');
    };

    ws.onmessage = (event) => {
      try {
        if (typeof event.data !== 'string') return;
        const payload = JSON.parse(event.data) as { type: string } & Record<string, unknown>;
        switch (payload.type) {
          case 'viewer:update': {
            const count = typeof payload.count === 'number' ? payload.count : undefined;
            if (typeof count === 'number' && Number.isFinite(count)) {
              viewerCountRef.current = count;
              clearViewerTimer();
              viewerTimerRef.current = window.setTimeout(flushViewerCount, VIEWER_DEBOUNCE_MS);
            }
            break;
          }
          case 'earnings:tokens': {
            const delta = typeof payload.delta === 'number' ? payload.delta : 0;
            if (delta) {
              addTokens(delta);
            }
            break;
          }
          case 'chat:message': {
            const message = payload.message as LiveMessage | undefined;
            if (message?.id) {
              addMessage({
                ...message,
                createdAt: typeof message.createdAt === 'number' ? message.createdAt : Date.now(),
              });
            }
            break;
          }
          case 'chat:typing': {
            const ids = Array.isArray(payload.ids) ? (payload.ids.filter((item) => typeof item === 'string') as string[]) : [];
            setTypingUsers(ids);
            break;
          }
          case 'room:error': {
            const message = typeof payload.message === 'string' ? payload.message : 'Live room error';
            setError(message);
            break;
          }
          default:
            break;
        }
      } catch {
        // ignore malformed message
      }
    };

    return () => {
      setConnectionState((state) => (state === 'closed' ? 'closed' : 'closing'));
      clearViewerTimer();
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      wsRef.current = null;
    };
  }, [roomId, enabled, addMessage, addTokens, flushViewerCount, setTypingUsers, setError]);

  const sendThroughSocket = useCallback((payload: unknown) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }
    try {
      ws.send(JSON.stringify(payload));
    } catch {
      setError('Unable to send a live room event right now.');
    }
  }, [setError]);

  const sendChatMessage = useCallback(
    async (message: LiveMessageInput) => {
      if (!message.text && !message.attachments?.length) {
        return;
      }
      const attachments = message.attachments?.length
        ? await Promise.all(
            message.attachments.map(async (file) => ({
              name: file.name,
              type: file.type,
              data: await encodeFile(file),
            })),
          )
        : undefined;

      sendThroughSocket({
        type: 'chat:send',
        message: {
          text: message.text?.trim() || undefined,
          attachments,
        },
      });
    },
    [sendThroughSocket],
  );

  const sendReaction = useCallback(
    (emoji: string) => {
      if (!emoji) return;
      sendThroughSocket({
        type: 'reaction:send',
        emoji,
      });
    },
    [sendThroughSocket],
  );

  const setTyping = useCallback(
    (typing: boolean) => {
      clearTimeout(typingTimeoutRef.current);
      sendThroughSocket({ type: 'chat:typing', typing });
      if (typing) {
        typingTimeoutRef.current = window.setTimeout(() => {
          sendThroughSocket({ type: 'chat:typing', typing: false });
        }, 3000);
      }
    },
    [sendThroughSocket],
  );

  useEffect(
    () => () => {
      clearViewerTimer();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    },
    [],
  );

  return useMemo(
    () => ({
      connectionState,
      sendChatMessage,
      sendReaction,
      setTyping,
    }),
    [connectionState, sendChatMessage, sendReaction, setTyping],
  );
}
