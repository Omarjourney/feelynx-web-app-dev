import { useMemo } from 'react';

import { useChatStore } from '@/state/chatStore';

export type ChatContextCTAProps = {
  onSendTip?: () => void;
  onBookCall?: () => void;
  onOpenGallery?: () => void;
};

export function ChatContextCTA({ onSendTip, onBookCall, onOpenGallery }: ChatContextCTAProps) {
  const { activeThreadId, threads, users, me } = useChatStore();

  const partner = useMemo(() => {
    if (!activeThreadId) {
      return undefined;
    }
    const thread = threads.find((item) => item.id === activeThreadId);
    const participant = thread?.participantIds.find((id) => id !== me?.id);
    return participant ? users[participant] : undefined;
  }, [activeThreadId, me?.id, threads, users]);

  if (!activeThreadId) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-white/5 bg-white/5 px-3 py-3 text-sm text-white/80">
      <span className="text-xs uppercase tracking-wide text-white/40">Quick actions</span>
      <button
        type="button"
        onClick={onSendTip}
        className="rounded-full bg-gradient-to-r from-fuchsia-500/80 via-fuchsia-400/80 to-rose-500/80 px-4 py-1.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:from-fuchsia-500 hover:to-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70"
      >
        Send Tip 💎
      </button>
      <button
        type="button"
        onClick={onBookCall}
        className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70"
      >
        Book 1:1 📞
      </button>
      <button
        type="button"
        onClick={onOpenGallery}
        className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70"
      >
        Gallery 📸
      </button>
      {partner?.presence === 'online' && (
        <span className="ml-auto flex items-center gap-2 text-xs uppercase tracking-wide text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" aria-hidden />
          Online
        </span>
      )}
    </div>
  );
}

export default ChatContextCTA;
