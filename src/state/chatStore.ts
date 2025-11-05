import { create } from 'zustand';

export type PresenceStatus = 'online' | 'offline' | 'recently';

export type User = {
  id: string;
  name: string;
  avatar?: string;
  isCreator?: boolean;
  presence?: PresenceStatus;
};

export type Attachment = {
  id: string;
  type: 'image';
  url: string;
  thumb?: string;
  width?: number;
  height?: number;
  alt?: string;
};

export type Message = {
  id: string;
  threadId: string;
  authorId: string;
  text?: string;
  attachments?: Attachment[];
  createdAt: number;
  delivered?: boolean;
  read?: boolean;
  replyToId?: string;
  reactions?: Record<string, number>;
};

export type Thread = {
  id: string;
  participantIds: string[];
  lastMessageAt: number;
  unreadCount?: number;
  preview?: string;
};

type MessagesByThread = Record<string, Message[]>;
type TypingByThread = Record<string, string[]>;

type ChatState = {
  me: User | null;
  users: Record<string, User>;
  threads: Thread[];
  messagesByThread: MessagesByThread;
  typingByThread: TypingByThread;
  activeThreadId: string | null;
  setActiveThread: (id: string | null) => void;
  upsertThreads: (threads: Thread[]) => void;
  upsertUsers: (users: User[]) => void;
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  setTyping: (threadId: string, userId: string, typing: boolean) => void;
  setMe: (user: User) => void;
  markThreadRead: (threadId: string) => void;
};

const sortThreads = (threads: Thread[]) =>
  [...threads].sort((a, b) => b.lastMessageAt - a.lastMessageAt);

const sortMessages = (messages: Message[]) =>
  [...messages].sort((a, b) => a.createdAt - b.createdAt);

export const useChatStore = create<ChatState>((set, get) => ({
  me: null,
  users: {},
  threads: [],
  messagesByThread: {},
  typingByThread: {},
  activeThreadId: null,
  setActiveThread: (id) => {
    set({ activeThreadId: id });
    if (id) {
      get().markThreadRead(id);
    }
  },
  upsertThreads: (incoming) =>
    set((state) => {
      const merged = new Map<string, Thread>();
      state.threads.forEach((thread) => merged.set(thread.id, thread));
      incoming.forEach((thread) => {
        const existing = merged.get(thread.id);
        merged.set(thread.id, {
          unreadCount: 0,
          ...existing,
          ...thread,
        });
      });
      return { threads: sortThreads(Array.from(merged.values())) };
    }),
  upsertUsers: (incoming) =>
    set((state) => {
      const next = { ...state.users };
      incoming.forEach((user) => {
        next[user.id] = {
          ...next[user.id],
          ...user,
        };
      });
      return { users: next };
    }),
  addMessage: (message) =>
    set((state) => {
      const currentMessages = state.messagesByThread[message.threadId] ?? [];
      const existingIndex = currentMessages.findIndex((item) => item.id === message.id);
      const nextMessages = existingIndex >= 0
        ? currentMessages.map((item, index) => (index === existingIndex ? { ...item, ...message } : item))
        : [...currentMessages, message];

      const sortedMessages = sortMessages(nextMessages);
      const threads = state.threads.map((thread) =>
        thread.id === message.threadId
          ? {
              ...thread,
              lastMessageAt: Math.max(thread.lastMessageAt, message.createdAt),
              unreadCount:
                message.authorId === get().me?.id
                  ? thread.unreadCount ?? 0
                  : (thread.unreadCount ?? 0) + (get().activeThreadId === thread.id ? 0 : 1),
              preview: message.text ?? thread.preview,
            }
          : thread,
      );

      return {
        messagesByThread: {
          ...state.messagesByThread,
          [message.threadId]: sortedMessages,
        },
        threads: sortThreads(threads),
      };
    }),
  addMessages: (messages) => {
    messages.forEach((message) => get().addMessage(message));
  },
  setTyping: (threadId, userId, typing) =>
    set((state) => {
      const current = new Set(state.typingByThread[threadId] ?? []);
      if (typing) {
        current.add(userId);
      } else {
        current.delete(userId);
      }

      return {
        typingByThread: {
          ...state.typingByThread,
          [threadId]: Array.from(current),
        },
      };
    }),
  setMe: (user) => set({ me: user }),
  markThreadRead: (threadId) =>
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              unreadCount: 0,
            }
          : thread,
      ),
    })),
}));
