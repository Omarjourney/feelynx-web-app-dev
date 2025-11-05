import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import ChatBubble from '@/components/chat/ChatBubble';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { useLiveStore, type LiveMessage, type LiveMessageInput } from '@/state/liveStore';
import { cn } from '@/lib/utils';

export type LiveChatDockProps = {
  currentUserId?: string;
  onSendMessage: (input: LiveMessageInput) => Promise<void>;
  onTyping?: (typing: boolean) => void;
  isLive?: boolean;
  variant?: 'desktop' | 'mobile';
  className?: string;
};

type DraftAttachment = {
  file: File;
  preview: string;
};

type LightboxState = {
  message: LiveMessage;
  index: number;
};

const DEFAULT_ROW_HEIGHT = 96;
const OVERSCAN_PX = 320;

function LiveChatMessage({
  message,
  isOwn,
  onSize,
  onPreview,
}: {
  message: LiveMessage;
  isOwn: boolean;
  onSize: (id: string, height: number) => void;
  onPreview: (message: LiveMessage, index: number) => void;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = rowRef.current;
    if (!element) return;
    const measure = () => {
      onSize(message.id, element.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(() => measure());
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [message.id, onSize]);

  return (
    <div ref={rowRef} className="px-2">
      <ChatBubble
        message={{
          id: message.id,
          threadId: 'live',
          authorId: message.userId,
          text: message.text,
          attachments: message.attachments?.map((attachment, index) => ({
            id: attachment.id || `${message.id}-${index}`,
            type: 'image',
            url: attachment.url,
            thumb: attachment.thumb,
            alt: attachment.alt,
          })),
          createdAt: message.createdAt,
          delivered: message.delivered,
          read: message.read,
        }}
        authorOverride={{
          id: message.userId,
          name: message.userName,
          avatar: message.userAvatar,
        }}
        isOwnOverride={isOwn}
        onMediaClick={(_, index) => onPreview(message, index)}
      />
    </div>
  );
}

export function LiveChatDock({
  currentUserId,
  onSendMessage,
  onTyping,
  isLive = false,
  variant = 'desktop',
  className,
}: LiveChatDockProps) {
  const messages = useLiveStore((state) => state.messages);
  const typingUserIds = useLiveStore((state) => state.typingUserIds);
  const error = useLiveStore((state) => state.error);
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<DraftAttachment[]>([]);
  const attachmentsRef = useRef<DraftAttachment[]>([]);
  const [sending, setSending] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const autoScrollRef = useRef(true);
  const heightsRef = useRef<Map<string, number>>(new Map());
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [measurementVersion, setMeasurementVersion] = useState(0);

  const shouldVirtualize = messages.length > 100;

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(
    () => () => {
      attachmentsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    },
    [],
  );

  const typingNames = useMemo(() => {
    return typingUserIds
      .filter((id) => id !== currentUserId)
      .map((id) => `@${id.slice(0, 6)}`)
      .slice(0, 3);
  }, [typingUserIds, currentUserId]);

  const updateAutoScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    const atBottom = element.scrollHeight - (element.scrollTop + element.clientHeight) < 120;
    autoScrollRef.current = atBottom;
    setScrollTop(element.scrollTop);
    setViewportHeight(element.clientHeight);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    updateAutoScroll();
    const handleScroll = () => updateAutoScroll();
    element.addEventListener('scroll', handleScroll, { passive: true });
    const resizeObserver = new ResizeObserver(() => updateAutoScroll());
    resizeObserver.observe(element);
    return () => {
      element.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [updateAutoScroll]);

  const handleSize = useCallback((id: string, height: number) => {
    const rounded = Math.max(48, Math.round(height));
    const current = heightsRef.current.get(id);
    if (current !== rounded) {
      heightsRef.current.set(id, rounded);
      setMeasurementVersion((value) => value + 1);
    }
  }, []);

  const virtualState = useMemo(() => {
    void measurementVersion;
    if (!shouldVirtualize) {
      return {
        items: messages,
        paddingTop: 0,
        paddingBottom: 0,
        totalHeight: 0,
      };
    }
    const heights = messages.map((message) => heightsRef.current.get(message.id) ?? DEFAULT_ROW_HEIGHT);
    const offsets: number[] = [];
    let total = 0;
    for (let index = 0; index < heights.length; index += 1) {
      offsets[index] = total;
      total += heights[index];
    }
    const viewportStart = Math.max(0, scrollTop - OVERSCAN_PX);
    const viewportEnd = scrollTop + viewportHeight + OVERSCAN_PX;
    let startIndex = 0;
    while (startIndex < offsets.length && offsets[startIndex] + heights[startIndex] < viewportStart) {
      startIndex += 1;
    }
    let endIndex = startIndex;
    while (endIndex < offsets.length && offsets[endIndex] < viewportEnd) {
      endIndex += 1;
    }
    endIndex = Math.min(endIndex + 1, messages.length);
    const paddingTop = offsets[startIndex] ?? 0;
    const paddingBottom = total - (offsets[endIndex] ?? total);
    const items = messages.slice(startIndex, endIndex);
    return {
      items,
      paddingTop,
      paddingBottom,
      totalHeight: total,
    };
  }, [messages, scrollTop, viewportHeight, measurementVersion, shouldVirtualize]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    if (!messages.length) {
      element.scrollTop = 0;
      return;
    }
    if (autoScrollRef.current) {
      const nextPosition = shouldVirtualize ? virtualState.totalHeight + 1000 : element.scrollHeight;
      element.scrollTo({ top: nextPosition, behavior: messages.length > 1 ? 'smooth' : 'auto' });
    }
  }, [messages.length, shouldVirtualize, virtualState.totalHeight]);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  }, []);

  const resetComposer = useCallback(() => {
    setDraft('');
    setAttachments((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.preview));
      return [];
    });
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = 'auto';
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (sending) return;
    if (!draft.trim() && attachments.length === 0) {
      return;
    }
    setSending(true);
    try {
      await onSendMessage({
        text: draft,
        attachments: attachments.map((item) => item.file),
      });
      resetComposer();
      onTyping?.(false);
    } finally {
      setSending(false);
    }
  }, [sending, draft, attachments, onSendMessage, onTyping, resetComposer]);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      await handleSend();
    },
    [handleSend],
  );

  const handleInput: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      const value = event.target.value;
      setDraft(value);
      event.target.style.height = 'auto';
      event.target.style.height = `${Math.min(event.target.scrollHeight, 220)}px`;
      onTyping?.(value.trim().length > 0);
    },
    [onTyping],
  );

  const handleBlur = useCallback(() => {
    onTyping?.(false);
  }, [onTyping]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  const handleFiles: React.ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }
    setAttachments((prev) => [
      ...prev,
      ...files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
    event.target.value = '';
  }, []);

  const composer = (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border-t border-white/10 bg-black/30 px-4 pb-safe pt-4 backdrop-blur-xl"
      aria-label="Chat composer"
    >
      {attachments.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {attachments.map((item, index) => (
            <div key={item.preview} className="relative h-20 w-20 flex-none overflow-hidden rounded-2xl border border-white/10">
              <img src={item.preview} alt="Attachment preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white"
                aria-label="Remove attachment"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-3">
        <label className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-xl text-white/80 transition hover:bg-white/15">
          <span role="img" aria-label="Add attachment">
            📎
          </span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </label>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-xl text-white/80 transition hover:bg-white/15"
          aria-label="Add emoji"
        >
          😊
        </button>
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={draft}
            onInput={handleInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Say hi to your fans…"
            rows={1}
            className="h-11 w-full resize-none rounded-3xl bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
            aria-label="Message input"
          />
        </div>
        <Button
          type="submit"
          disabled={!isLive || sending || (!draft.trim() && attachments.length === 0)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500 text-white shadow-lg shadow-fuchsia-500/30 transition hover:from-fuchsia-400 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          ➤
        </Button>
      </div>
    </form>
  );

  const header = (
    <div className="flex items-center justify-between px-4 pb-3 pt-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">Live chat</h2>
        <p className="text-xs text-white/50">Keep the vibe high. Messages appear instantly.</p>
      </div>
      <span className={cn('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', isLive ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/60')}>
        {isLive ? 'Live' : 'Offline'}
      </span>
    </div>
  );

  const messageList = (
    <div ref={scrollRef} role="log" aria-live="polite" className="flex-1 overflow-y-auto px-1 pb-6">
      <div
        className={cn(
          'relative flex flex-col gap-4',
          shouldVirtualize && 'min-h-full',
        )}
        style={
          shouldVirtualize
            ? {
                paddingTop: virtualState.paddingTop,
                paddingBottom: virtualState.paddingBottom,
                minHeight: virtualState.totalHeight,
              }
            : undefined
        }
      >
        {(shouldVirtualize ? virtualState.items : messages).map((message) => (
          <LiveChatMessage
            key={message.id}
            message={message}
            isOwn={message.userId === currentUserId}
            onSize={handleSize}
            onPreview={(item, index) => setLightbox({ message: item, index })}
          />
        ))}
        {!messages.length && (
          <p className="px-4 text-sm text-white/50">No messages yet. Say hello to kick things off!</p>
        )}
      </div>
    </div>
  );

  const typingIndicator = typingNames.length ? (
    <div className="px-4 pb-3 text-xs text-white/60" aria-live="polite">
      <AnimatePresence>
        <motion.div
          key={typingNames.join(',')}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
        >
          {typingNames.join(', ')} typing…
        </motion.div>
      </AnimatePresence>
    </div>
  ) : null;

  const content = (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/8 shadow-2xl shadow-black/40 backdrop-blur-3xl',
        className,
      )}
    >
      {header}
      {error && (
        <p className="px-4 text-xs text-rose-200/80" role="alert">
          {error}
        </p>
      )}
      {messageList}
      {typingIndicator}
      {composer}
      <Dialog open={Boolean(lightbox)} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="max-w-3xl border-white/20 bg-black/80 p-0 backdrop-blur-3xl">
          {lightbox && lightbox.message.attachments?.[lightbox.index] && (
            <img
              src={lightbox.message.attachments[lightbox.index]?.url}
              alt={lightbox.message.attachments[lightbox.index]?.alt ?? 'Attachment preview'}
              className="h-full w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  if (variant === 'mobile') {
    return (
      <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500/90 via-violet-600/90 to-sky-500/90 text-2xl text-white shadow-2xl shadow-fuchsia-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70"
            aria-label="Open live chat"
          >
            💬
          </button>
        </DrawerTrigger>
        <DrawerContent className="h-[90vh] overflow-hidden border-white/15 bg-black/70 backdrop-blur-3xl">
          <div className="mx-auto h-full w-full max-w-lg p-4">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return content;
}

export default LiveChatDock;
