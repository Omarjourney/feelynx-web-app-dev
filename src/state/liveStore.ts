import { create } from 'zustand';

export type LiveMessageAttachment = {
  url: string;
  type: 'image';
  thumb?: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type LiveMessage = {
  id: string;
  userId: string;
  text?: string;
  attachments?: LiveMessageAttachment[];
  createdAt: number;
};

export type LiveMessageInput = {
  text?: string;
  attachments?: File[];
};

type LiveState = {
  isLive: boolean;
  viewerCount: number;
  peakViewers: number;
  tokenEarnings: number;
  startTime: number | null;
  messages: LiveMessage[];
  error: string | null;
  setLive: (isLive: boolean, startTime?: number | null) => void;
  setViewerCount: (count: number) => void;
  addTokens: (delta: number) => void;
  addMessage: (message: LiveMessage) => void;
  reset: () => void;
  setError: (message: string | null) => void;
};

const INITIAL_STATE: Omit<LiveState, 'setLive' | 'setViewerCount' | 'addTokens' | 'addMessage' | 'reset' | 'setError'> = {
  isLive: false,
  viewerCount: 0,
  peakViewers: 0,
  tokenEarnings: 0,
  startTime: null,
  messages: [],
  error: null,
};

export const useLiveStore = create<LiveState>((set) => ({
  ...INITIAL_STATE,
  setLive: (isLive, startTime = Date.now()) => {
    if (isLive) {
      set({ isLive: true, startTime: startTime ?? Date.now(), error: null });
    } else {
      set({
        ...INITIAL_STATE,
        isLive: false,
        startTime: null,
      });
    }
  },
  setViewerCount: (count) => {
    set((state) => ({
      viewerCount: count,
      peakViewers: Math.max(state.peakViewers, count),
    }));
  },
  addTokens: (delta) => {
    if (!delta) return;
    set((state) => ({ tokenEarnings: Math.max(0, state.tokenEarnings + delta) }));
  },
  addMessage: (message) => {
    set((state) => {
      const existingIndex = state.messages.findIndex((item) => item.id === message.id);
      const nextMessages = existingIndex >= 0
        ? state.messages.map((item, index) => (index === existingIndex ? { ...item, ...message } : item))
        : [...state.messages, message];

      const trimmed = nextMessages.length > 500 ? nextMessages.slice(nextMessages.length - 500) : nextMessages;

      return { messages: trimmed };
    });
  },
  reset: () => {
    set({ ...INITIAL_STATE });
  },
  setError: (error) => set({ error }),
}));

export type { LiveState };
