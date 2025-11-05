import { useEffect } from 'react';
import { useChatStore, Message, Thread, User } from '@/state/chatStore';

const DEMO_ME: User = {
  id: 'me',
  name: 'You',
  avatar: '/avatars/me.png',
};

// Temporary demo data until real APIs are connected.
async function apiListThreads(): Promise<Thread[]> {
  const now = Date.now();
  return [
    { id: 't1', participantIds: ['me', 'creator1'], lastMessageAt: now - 1000, unreadCount: 0, preview: 'See you soon!' },
    { id: 't2', participantIds: ['me', 'creator2'], lastMessageAt: now - 60000, unreadCount: 2, preview: 'New drop 💫' },
  ];
}

async function apiListUsers(): Promise<User[]> {
  return [
    { id: 'creator1', name: 'Nova', avatar: '/avatars/nova.png', isCreator: true, presence: 'online' },
    { id: 'creator2', name: 'Lux', avatar: '/avatars/lux.png', isCreator: true, presence: 'recently' },
  ];
}

async function apiListMessages(threadId: string): Promise<Message[]> {
  const now = Date.now();
  if (threadId === 't1') {
    return [
      {
        id: 'm1',
        threadId,
        authorId: 'creator1',
        text: 'Hey there ✨',
        createdAt: now - 1000 * 60 * 5,
        delivered: true,
        read: true,
      },
      {
        id: 'm2',
        threadId,
        authorId: 'me',
        text: 'Hi Nova! Loved your latest drop.',
        createdAt: now - 1000 * 60 * 3,
        delivered: true,
        read: true,
      },
    ];
  }

  return [
    {
      id: 'm3',
      threadId,
      authorId: 'creator2',
      text: 'Going live in 10! Want a front-row spot?',
      createdAt: now - 1000 * 60 * 25,
      delivered: true,
      read: false,
    },
  ];
}

export function useBootstrapChat() {
  const { setMe, upsertThreads, upsertUsers, addMessages, activeThreadId } = useChatStore();

  useEffect(() => {
    setMe(DEMO_ME);
  }, [setMe]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [threads, users] = await Promise.all([apiListThreads(), apiListUsers()]);
      if (!mounted) return;
      upsertThreads(threads);
      upsertUsers(users);
    })();
    return () => {
      mounted = false;
    };
  }, [upsertThreads, upsertUsers]);

  useEffect(() => {
    if (!activeThreadId) {
      return;
    }

    let cancelled = false;
    (async () => {
      const messages = await apiListMessages(activeThreadId);
      if (!cancelled) {
        addMessages(messages);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeThreadId, addMessages]);
}

export async function apiSendMessage({
  threadId,
  authorId,
  text,
  files,
}: {
  threadId: string;
  authorId: string;
  text?: string;
  files?: File[];
}): Promise<Message> {
  const createdAt = Date.now();
  const attachments = files?.length
    ? await Promise.all(
        files.map(async (file, index) => ({
          id: `${createdAt}-${index}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 8)}`,
          type: 'image' as const,
          url: URL.createObjectURL(file),
          alt: file.name,
        })),
      )
    : undefined;

  return {
    id: `local-${createdAt}`,
    threadId,
    authorId,
    text,
    attachments,
    createdAt,
    delivered: true,
    read: authorId === DEMO_ME.id,
  };
}
