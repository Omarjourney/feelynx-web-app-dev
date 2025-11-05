import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { LiveMessage, LiveMessageInput } from '@/state/liveStore';
import type { LiveRoomConnectionState } from '@/hooks/useLiveRoom';
import { toast } from '@/hooks/use-toast';

const VIRTUALIZED_WINDOW = 160;

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

type AttachmentPreview = {
  file: File;
  preview: string;
};

type LiveChatDockProps = {
  messages: LiveMessage[];
  onSend: (input: LiveMessageInput) => Promise<void>;
  isLive: boolean;
  connectionState: LiveRoomConnectionState;
  currentUserId?: string | null;
};

type LightboxState = { messageId: string; index: number } | null;

function LiveMessageBubble({ message, isMe, onOpenLightbox }: { message: LiveMessage; isMe: boolean; onOpenLightbox: (messageId: string, index: number) => void }) {
  return (
    <article
      className={cn(
        'max-w-full rounded-3xl bg-white/8 p-3 shadow-lg backdrop-blur',
        isMe ? 'ml-auto bg-gradient-to-br from-fuchsia-500/70 via-violet-500/70 to-indigo-500/70 text-white' : 'mr-auto text-white/90',
      )}
    >
      {message.text && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.text}</p>}
      {message.attachments?.length ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {message.attachments.map((attachment, index) => (
            <button
              key={`${message.id}-${index}`}
              type="button"
              onClick={() => onOpenLightbox(message.id, index)}
              className="group relative overflow-hidden rounded-2xl border border-white/20"
              aria-label="Open attachment"
            >
              <img
                src={attachment.thumb ?? attachment.url}
                alt={attachment.alt ?? 'Shared image'}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                loading="lazy"
              />
              <span className="pointer-events-none absolute inset-0 rounded-2xl border border-white/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      ) : null}
      <span className="mt-2 block text-[11px] uppercase tracking-[0.2em] text-white/60">
        {isMe ? 'You • ' : 'Viewer • '}
        {formatTime(message.createdAt)}
      </span>
    </article>
  );
}

export function LiveChatDock({ messages, onSend, isLive, connectionState, currentUserId }: LiveChatDockProps) {
  const isMobile = useIsMobile();
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isMobile) {
      setSheetOpen(false);
    }
  }, [isMobile]);

  useEffect(() => () => {
    attachments.forEach((item) => URL.revokeObjectURL(item.preview));
  }, [attachments]);

  const [showAll, setShowAll] = useState(false);
  const shouldVirtualize = !showAll && messages.length > VIRTUALIZED_WINDOW;
  const displayedMessages = useMemo(
    () => (shouldVirtualize ? messages.slice(-VIRTUALIZED_WINDOW) : messages),
    [messages, shouldVirtualize],
  );
  const hiddenCount = shouldVirtualize ? messages.length - displayedMessages.length : 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedMessages.length]);

  const handleDraftChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.target.value);
  };

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const previews = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setAttachments((prev) => [...prev, ...previews]);
    event.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  const handleSend = async (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text && attachments.length === 0) return;

    try {
      await onSend({ text: text || undefined, attachments: attachments.map((item) => item.file) });
      setDraft('');
      attachments.forEach((item) => URL.revokeObjectURL(item.preview));
      setAttachments([]);
    } catch (error) {
      toast({
        title: 'Message failed to send',
        description: 'We could not deliver that vibe. Try again in a moment.',
        variant: 'destructive',
      });
    }
  };

  const chatContent = (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Live Chat</p>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {isLive ? connectionState === 'open' ? 'Connected' : 'Connecting…' : 'Offline'}
        </span>
      </div>
      <div className="relative flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black/35 shadow-inner shadow-black/40 backdrop-blur-xl">
        <ScrollArea className="h-full">
          <div className="flex h-full flex-col gap-3 p-4" role="log" aria-live="polite">
            {hiddenCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(true)}
                className="mx-auto w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs text-white/70"
              >
                Show previous {hiddenCount} messages
              </Button>
            )}
            {displayedMessages.map((message) => (
              <LiveMessageBubble
                key={message.id}
                message={message}
                isMe={message.userId === currentUserId}
                onOpenLightbox={(messageId, index) => setLightbox({ messageId, index })}
              />
            ))}
            {displayedMessages.length === 0 && (
              <p className="text-center text-sm text-white/50">No messages yet. Say hi to your fans! ✨</p>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </div>
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-3" aria-label="Attachment previews">
          {attachments.map((item, index) => (
            <div key={`${item.preview}-${index}`} className="group relative h-20 w-20 overflow-hidden rounded-2xl border border-white/20">
              <img src={item.preview} alt="Attachment preview" className="h-full w-full object-cover" />
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                onClick={() => removeAttachment(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSend} className="space-y-3" aria-label="Compose live message">
        <Textarea
          value={draft}
          onChange={handleDraftChange}
          placeholder={isLive ? 'Send a vibe to your community…' : 'Chat is disabled while offline'}
          disabled={!isLive}
          className="min-h-[72px] rounded-3xl border border-white/10 bg-black/40 text-sm text-white placeholder:text-white/40 focus-visible:ring-2 focus-visible:ring-fuchsia-400"
          aria-label="Message"
        />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isLive}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/20"
            >
              📎 Attach
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleAttachmentChange}
            />
            {draft && (
              <motion.span
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs uppercase tracking-[0.3em] text-white/50"
                aria-live="polite"
              >
                Typing…
              </motion.span>
            )}
          </div>
          <Button
            type="submit"
            disabled={!isLive || (!draft.trim() && attachments.length === 0)}
            className="rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_0_25px_rgba(217,70,239,0.35)] hover:brightness-110"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );

  const sheetContent = (
    <SheetContent
      side="bottom"
      className="h-[90vh] rounded-t-[24px] border-white/10 bg-gradient-to-b from-black/40 to-black/80 text-white backdrop-blur-2xl"
    >
      <SheetHeader>
        <SheetTitle className="text-lg font-semibold tracking-wide text-white">Community Chat</SheetTitle>
      </SheetHeader>
      <div className="mt-4 flex h-[calc(100%-2rem)] flex-col gap-4 overflow-hidden pb-6">
        {chatContent}
      </div>
    </SheetContent>
  );

  return (
    <>
      <div className="hidden h-full lg:block">
        <aside className="sticky top-6 flex h-[calc(100vh-8rem)] flex-col rounded-3xl border border-white/10 bg-black/35 p-6 text-white shadow-2xl backdrop-blur-2xl">
          {chatContent}
        </aside>
      </div>
      {isMobile ? (
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 text-2xl text-white shadow-[0_0_40px_rgba(232,121,249,0.45)] focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Open live chat"
            >
              💬
            </Button>
          </SheetTrigger>
          {sheetContent}
        </Sheet>
      ) : null}
      <Dialog open={!!lightbox} onOpenChange={(open) => !open && setLightbox(null)}>
        <DialogContent className="max-w-3xl border-white/10 bg-black/80 p-0 text-white shadow-2xl backdrop-blur-2xl">
          {lightbox && (
            <img
              src={messages
                .find((item) => item.id === lightbox.messageId)?.attachments?.[lightbox.index]?.url}
              alt="Attachment preview"
              className="h-full w-full rounded-3xl object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LiveChatDock;
