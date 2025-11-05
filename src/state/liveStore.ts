import { create } from 'zustand';

export type LiveAttachment = {
  id: string;
  type: 'image';
  url: string;
  thumb?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type LiveMessage = {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  text?: string;
  attachments?: LiveAttachment[];
  createdAt: number;
  delivered?: boolean;
  read?: boolean;
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
  typingUserIds: string[];
  error: string | null;
  setLive: (next: boolean) => void;
  setViewerCount: (count: number) => void;
  addTokens: (delta: number) => void;
  addMessage: (message: LiveMessage) => void;
  setTypingUsers: (ids: string[]) => void;
  setStartTime: (timestamp: number | null) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

const initialState: Pick<
  LiveState,
  | 'isLive'
  | 'viewerCount'
  | 'peakViewers'
  | 'tokenEarnings'
  | 'startTime'
  | 'messages'
  | 'typingUserIds'
  | 'error'
> = {
  isLive: false,
  viewerCount: 0,
  peakViewers: 0,
  tokenEarnings: 0,
  startTime: null,
  messages: [],
  typingUserIds: [],
  error: null,
};

export const useLiveStore = create<LiveState>((set, get) => ({
  ...initialState,
  setLive: (next) => {
    const wasLive = get().isLive;
    set({ isLive: next });
    if (next && !wasLive) {
      set({ startTime: Date.now(), error: null });
    }
    if (!next) {
      set({ typingUserIds: [] });
    }
  },
  setViewerCount: (count) =>
    set((state) => ({
      viewerCount: count,
      peakViewers: Math.max(state.peakViewers, count),
    })),
  addTokens: (delta) =>
    set((state) => ({
      tokenEarnings: Math.max(0, state.tokenEarnings + delta),
    })),
  addMessage: (message) =>
    set((state) => {
      const existingIndex = state.messages.findIndex((item) => item.id === message.id);
      const nextMessages = existingIndex >= 0
        ? state.messages.map((item, index) => (index === existingIndex ? { ...item, ...message } : item))
        : [...state.messages, message];

      nextMessages.sort((a, b) => a.createdAt - b.createdAt);

      return {
        messages: nextMessages,
      };
    }),
  setTypingUsers: (ids) => set({ typingUserIds: Array.from(new Set(ids)) }),
  setStartTime: (timestamp) => set({ startTime: timestamp }),
  setError: (message) => set({ error: message }),
  reset: () => set({ ...initialState }),
}));

export type LiveStore = ReturnType<typeof useLiveStore>;
