import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

import { Thread, useChatStore } from '@/state/chatStore';
import { cn } from '@/lib/utils';

const shimmer = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function formatRelativeTime(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getPartner(thread: Thread, meId: string | undefined) {
  return thread.participantIds.find((id) => id !== meId) ?? thread.participantIds[0];
}

type ThreadRowProps = {
  thread: Thread;
  isActive: boolean;
  onThreadSelected?: () => void;
};

function ThreadRow({ thread, isActive, onThreadSelected }: ThreadRowProps) {
  const { users, me, setActiveThread } = useChatStore();
  const partnerId = useMemo(() => getPartner(thread, me?.id), [thread, me?.id]);
  const partner = partnerId ? users[partnerId] : undefined;
  const unread = thread.unreadCount ?? 0;
  const presence = partner?.presence ?? 'offline';

  return (
    <motion.li
      layout
      initial={shimmer.initial}
      animate={shimmer.animate}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
    >
      <button
        type="button"
        onClick={() => {
          setActiveThread(thread.id);
          onThreadSelected?.();
        }}
        className={cn(
          'group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70',
          isActive
            ? 'bg-white/15 shadow-lg shadow-fuchsia-500/10'
            : 'hover:bg-white/8 focus-visible:bg-white/10',
        )}
        aria-current={isActive ? 'true' : undefined}
      >
        <span className="relative inline-flex h-12 w-12 flex-none items-center justify-center rounded-full bg-white/10 shadow-inner">
          {partner?.avatar ? (
            <img
              src={partner.avatar}
              alt={partner.name}
              className="h-full w-full rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-lg">💫</span>
          )}
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-[#0c0916]',
              presence === 'online'
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
                : presence === 'recently'
                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                  : 'bg-zinc-500',
            )}
            aria-hidden
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-white/90 group-hover:text-white">
              {partner?.name ?? 'Conversation'}
            </span>
            {partner?.isCreator && (
              <span className="rounded-full bg-fuchsia-500/15 px-2 text-[10px] uppercase tracking-wide text-fuchsia-200">
                Creator
              </span>
            )}
          </span>
          <span className="mt-1 line-clamp-1 text-xs text-white/60">{thread.preview ?? 'Start the vibe ✨'}</span>
        </span>
        <span className="flex flex-col items-end gap-2 text-[11px] font-medium text-white/50">
          <span>{formatRelativeTime(thread.lastMessageAt)}</span>
          {unread > 0 && (
            <span className="inline-flex h-5 min-w-[1.4rem] items-center justify-center rounded-full bg-fuchsia-500/80 px-1 text-xs text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </span>
      </button>
    </motion.li>
  );
}

const MemoThreadRow = memo(ThreadRow);

export type ChatThreadListProps = {
  onThreadSelected?: () => void;
};

export function ChatThreadList({ onThreadSelected }: ChatThreadListProps = {}) {
  const { threads, activeThreadId } = useChatStore();

  return (
    <aside
      className="flex h-full flex-col border-b border-white/10 bg-[#0d0b1c]/80 backdrop-blur-xl md:border-b-0 md:border-r"
      aria-label="Conversations"
    >
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Inbox</span>
          <span className="text-lg font-bold text-white">Messages</span>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
          {threads.length} chats
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <motion.ul layout className="space-y-2" role="list">
          {threads.map((thread) => (
            <MemoThreadRow
              key={thread.id}
              thread={thread}
              isActive={thread.id === activeThreadId}
              onThreadSelected={onThreadSelected}
            />
          ))}
          {threads.length === 0 && (
            <li className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-10 text-center text-sm text-white/60">
              No conversations yet. Start one and make their day ✨
            </li>
          )}
        </motion.ul>
      </div>
    </aside>
  );
}

export default ChatThreadList;
