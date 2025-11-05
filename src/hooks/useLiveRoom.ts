import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  LiveMessage,
  LiveMessageInput,
  LiveMessageAttachment,
  useLiveStore,
} from '@/state/liveStore';

type LiveRoomEvent =
  | { type: 'viewer:update'; count: number }
  | { type: 'earnings:tokens'; delta: number }
  | { type: 'chat:message'; message: LiveMessage }
  | { type: 'room:error'; message: string }
  | { type: string; [key: string]: unknown };

type LiveRoomConnectionState = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

type UseLiveRoomOptions = {
  enabled?: boolean;
};

const VIEWER_UPDATE_DEBOUNCE = 200;

function serializeAttachments(files: File[] | undefined) {
  if (!files?.length) return Promise.resolve<LiveMessageAttachment[] | undefined>(undefined);

  return Promise.all(
    files.map(
      (file) =>
        new Promise<LiveMessageAttachment>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              type: 'image',
              url: typeof reader.result === 'string' ? reader.result : '',
              alt: file.name,
            });
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        }),
    ),
  );
}

export function useLiveRoom(roomId: string | null | undefined, options: UseLiveRoomOptions = {}) {
  const { enabled = true } = options;
  const [connectionState, setConnectionState] = useState<LiveRoomConnectionState>('idle');
  const {
    setViewerCount,
    addTokens,
    addMessage,
    setError,
  } = useLiveStore((state) => ({
    setViewerCount: state.setViewerCount,
    addTokens: state.addTokens,
    addMessage: state.addMessage,
    setError: state.setError,
  }));

  const wsRef = useRef<WebSocket | null>(null);
  const viewerDebounceRef = useRef<number>();
  const pendingViewerCountRef = useRef<number | null>(null);

  const clearViewerDebounce = useCallback(() => {
    if (viewerDebounceRef.current) {
      window.clearTimeout(viewerDebounceRef.current);
      viewerDebounceRef.current = undefined;
    }
  }, []);

  const close = useCallback(() => {
    clearViewerDebounce();
    const socket = wsRef.current;
    if (socket) {
      socket.close(1000, 'closing');
      wsRef.current = null;
    }
  }, [clearViewerDebounce]);

  useEffect(() => {
    if (!roomId || !enabled) {
      close();
      setConnectionState(roomId && enabled ? 'idle' : 'closed');
      return undefined;
    }

    const wsBase = import.meta.env.VITE_WS_URL;
    if (!wsBase) {
      setError('Live WebSocket URL is not configured.');
      setConnectionState('error');
      return undefined;
    }

    const normalized = wsBase.endsWith('/') ? wsBase.slice(0, -1) : wsBase;
    const url = `${normalized}/live/${roomId}`;

    try {
      const socket = new WebSocket(url);
      wsRef.current = socket;
      setConnectionState('connecting');
      setError(null);

      const handleMessage = (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data as string) as LiveRoomEvent;
          switch (payload.type) {
            case 'viewer:update': {
              pendingViewerCountRef.current = payload.count;
              if (!viewerDebounceRef.current) {
                viewerDebounceRef.current = window.setTimeout(() => {
                  if (pendingViewerCountRef.current !== null) {
                    setViewerCount(pendingViewerCountRef.current);
                    pendingViewerCountRef.current = null;
                  }
                  viewerDebounceRef.current = undefined;
                }, VIEWER_UPDATE_DEBOUNCE);
              }
              break;
            }
            case 'earnings:tokens': {
              addTokens(payload.delta);
              break;
            }
            case 'chat:message': {
              addMessage(payload.message);
              break;
            }
            case 'room:error': {
              setError(payload.message);
              break;
            }
            default: {
              break;
            }
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to parse live event');
        }
      };

      const handleOpen = () => {
        setConnectionState('open');
      };

      const handleClose = () => {
        setConnectionState('closed');
        clearViewerDebounce();
      };

      const handleError = (event: Event) => {
        if (import.meta.env.DEV) {
          console.error('Live room socket error', event);
        }
        setConnectionState('error');
        setError('Live connection error. Please try again.');
      };

      socket.addEventListener('open', handleOpen);
      socket.addEventListener('message', handleMessage);
      socket.addEventListener('error', handleError);
      socket.addEventListener('close', handleClose);

      return () => {
        socket.removeEventListener('open', handleOpen);
        socket.removeEventListener('message', handleMessage);
        socket.removeEventListener('error', handleError);
        socket.removeEventListener('close', handleClose);
        close();
      };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to connect to live room');
      setConnectionState('error');
      return undefined;
    }
  }, [roomId, enabled, addMessage, addTokens, close, clearViewerDebounce, setError, setViewerCount]);

  const send = useCallback((data: Record<string, unknown>) => {
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error('Live chat is not connected');
    }
    socket.send(JSON.stringify(data));
  }, []);

  const sendChatMessage = useCallback(
    async (input: LiveMessageInput) => {
      const attachments = await serializeAttachments(input.attachments);
      send({ type: 'chat:send', message: { text: input.text, attachments } });
    },
    [send],
  );

  const sendReaction = useCallback(
    (emoji: string) => {
      try {
        send({ type: 'reaction:send', emoji });
      } catch (error) {
        // surface via store error to notify UI without throwing.
        setError(error instanceof Error ? error.message : 'Unable to send reaction');
      }
    },
    [send, setError],
  );

  const value = useMemo(
    () => ({
      connectionState,
      sendChatMessage,
      sendReaction,
      close,
      isConnected: connectionState === 'open',
    }),
    [close, connectionState, sendChatMessage, sendReaction],
  );

  return value;
}

export type { LiveRoomConnectionState };
