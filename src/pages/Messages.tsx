import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ChatThreadList } from '@/components/chat/ChatThreadList';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatComposer from '@/components/chat/ChatComposer';
import ChatContextCTA from '@/components/chat/ChatContextCTA';
import ChatMediaViewer from '@/components/chat/ChatMediaViewer';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { useBootstrapChat } from '@/hooks/useChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { Attachment, Message, useChatStore } from '@/state/chatStore';
import { cn } from '@/lib/utils';

function formatDayLabel(date: Date) {
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
  const target = date.toDateString();
  if (target === today) return 'Today';
  if (target === yesterday) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function groupMessages(messages: Message[]) {
  const map = new Map<string, Message[]>();
  messages.forEach((message) => {
    const key = new Date(message.createdAt).toDateString();
    const existing = map.get(key) ?? [];
    existing.push(message);
    map.set(key, existing);
  });

  return Array.from(map.entries()).map(([key, value]) => ({
    key,
    label: formatDayLabel(new Date(key)),
    messages: value,
  }));
}

export default function MessagesPage() {
  const isMobile = useIsMobile();
  const { threads, activeThreadId, setActiveThread, messagesByThread, users, me } = useChatStore();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [mobileView, setMobileView] = useState<'threads' | 'chat'>(isMobile ? 'threads' : 'chat');
  const navigate = useNavigate();

  useBootstrapChat();

  useEffect(() => {
    if (!activeThreadId && threads.length) {
      setActiveThread(threads[0].id);
    }
  }, [activeThreadId, setActiveThread, threads]);

  useEffect(() => {
    if (!isMobile) {
      setMobileView('chat');
    } else if (!activeThreadId) {
      setMobileView('threads');
    }
  }, [isMobile, activeThreadId]);

  useEffect(() => {
    if (isMobile && activeThreadId) {
      setMobileView('chat');
    }
  }, [isMobile, activeThreadId]);

  const messages = useMemo(() => (activeThreadId ? messagesByThread[activeThreadId] ?? [] : []), [activeThreadId, messagesByThread]);
  const grouped = useMemo(() => groupMessages(messages), [messages]);

  const mediaCatalog = useMemo(() => {
    const catalog: { attachment: Attachment; messageId: string; localIndex: number }[] = [];
    messages.forEach((message) => {
      message.attachments?.forEach((attachment, index) => {
        catalog.push({ attachment, messageId: message.id, localIndex: index });
      });
    });
    return catalog;
  }, [messages]);

  const conversationPartner = useMemo(() => {
    if (!activeThreadId) return undefined;
    const thread = threads.find((item) => item.id === activeThreadId);
    const partnerId = thread?.participantIds.find((id) => id !== me?.id);
    return partnerId ? users[partnerId] : undefined;
  }, [activeThreadId, me?.id, threads, users]);

  const handleMediaClick = useCallback(
    (messageId: string, index: number) => {
      const catalogIndex = mediaCatalog.findIndex((entry) => entry.messageId === messageId && entry.localIndex === index);
      if (catalogIndex >= 0) {
        setViewerIndex(catalogIndex);
        setViewerOpen(true);
      }
    },
    [mediaCatalog],
  );

  const conversationHeader = (
    <header
      className="flex h-16 flex-none items-center justify-between border-b border-white/10 bg-[#0d061c]/80 px-4 backdrop-blur-xl"
      aria-label="Conversation header"
    >
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileView('threads')}
            className="mr-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/15 hover:text-white"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/10">
            <img
              src={conversationPartner?.avatar ?? '/avatars/placeholder.png'}
              alt={conversationPartner?.name ?? 'Conversation partner'}
              className="h-full w-full object-cover"
            />
            {conversationPartner?.presence === 'online' && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]" aria-hidden />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{conversationPartner?.name ?? 'Select a conversation'}</p>
            <p className="text-xs text-white/60">
              {conversationPartner?.presence === 'online' ? 'Active now' : 'Spark a moment with a kind note'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-white/60">
        <Sparkles className="h-4 w-4 text-fuchsia-300" aria-hidden />
        Magic moments happen in the DMs
      </div>
    </header>
  );

  const chatPane = (
    <div className="flex h-full flex-1 flex-col">
      {conversationHeader}
      <div
        className="flex-1 space-y-6 overflow-y-auto px-4 py-6"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {grouped.map((group) => (
          <section key={group.key} className="space-y-4">
            <div className="flex items-center justify-center">
              <span className="rounded-full bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-wide text-white/60">
                {group.label}
              </span>
            </div>
            {group.messages.map((message) => (
              <ChatBubble key={message.id} message={message} onMediaClick={handleMediaClick} />
            ))}
          </section>
        ))}
        <TypingIndicator threadId={activeThreadId ?? ''} />
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-white/60">
            Send the first note and set the tone 💜
          </div>
        )}
      </div>
      <ChatContextCTA
        onOpenGallery={() => {
          if (mediaCatalog.length) {
            setViewerIndex(0);
            setViewerOpen(true);
          }
        }}
        onSendTip={() => navigate('/token-shop')}
        onBookCall={() => navigate('/connect')}
      />
      <ChatComposer />
    </div>
  );

  return (
    <div className="flex min-h-[calc(100dvh-0px)] flex-col bg-gradient-to-br from-[#090315] via-[#120924] to-[#05020e] text-white">
      <div className="relative mx-auto flex w-full max-w-[1380px] flex-1 overflow-hidden rounded-t-3xl border border-white/10 bg-white/5 backdrop-blur-2xl">
        <AnimatePresence initial={false} mode="wait">
          {(!isMobile || mobileView === 'threads') && (
            <motion.div
              key="threads"
              initial={{ x: isMobile ? '-100%' : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? '-100%' : 0, opacity: isMobile ? 0 : 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
              className={cn('w-full flex-none md:w-80', mobileView === 'chat' && 'hidden md:block')}
            >
              <ChatThreadList onThreadSelected={() => setMobileView('chat')} />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false} mode="wait">
          {(!isMobile || mobileView === 'chat') && (
            <motion.section
              key="chat"
              initial={{ x: isMobile ? '100%' : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? '100%' : 0, opacity: isMobile ? 0 : 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 32 }}
              className="flex min-w-0 flex-1 flex-col"
            >
              {activeThreadId ? (
                chatPane
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-white/70">
                  <p className="text-2xl font-semibold text-white">Choose a conversation</p>
                  <p className="max-w-sm text-sm">
                    Select a creator from your inbox to continue the vibe. Need to discover someone new? Explore the Discover
                    tab for fresh energy.
                  </p>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
      <ChatMediaViewer
        open={viewerOpen}
        attachments={mediaCatalog.map((entry) => entry.attachment)}
        index={viewerIndex}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}
