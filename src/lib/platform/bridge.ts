interface PlatformBridge {
  registerChannel: (channel: string, handler: (payload: unknown) => void) => void;
  emit: (channel: string, payload: unknown) => void;
}

declare global {
  interface Window {
    __FEELYNX_BRIDGE__?: PlatformBridge;
  }
}

const listeners = new Map<string, Set<(payload: unknown) => void>>();

const defaultBridge: PlatformBridge = {
  registerChannel: (channel, handler) => {
    if (!listeners.has(channel)) {
      listeners.set(channel, new Set());
    }
    listeners.get(channel)!.add(handler);
  },
  emit: (channel, payload) => {
    listeners.get(channel)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error('Bridge handler failed', channel, error);
      }
    });
  },
};

export const initializePlatformBridge = () => {
  if (typeof window === 'undefined') return;
  if (!window.__FEELYNX_BRIDGE__) {
    window.__FEELYNX_BRIDGE__ = defaultBridge;
    window.__FEELYNX_BRIDGE__.emit('bridge:init', { platform: 'web', timestamp: Date.now() });
  }
};

export const emitToBridge = (channel: string, payload: unknown) => {
  if (typeof window === 'undefined') return;
  window.__FEELYNX_BRIDGE__?.emit(channel, payload);
};

export const registerBridgeChannel = (channel: string, handler: (payload: unknown) => void) => {
  if (typeof window === 'undefined') return () => undefined;
  window.__FEELYNX_BRIDGE__?.registerChannel(channel, handler);
  return () => {
    listeners.get(channel)?.delete(handler);
  };
};

