import { memo } from 'react';
import { motion } from 'framer-motion';

import { Message, useChatStore } from '@/state/chatStore';
import { cn } from '@/lib/utils';

export type ChatBubbleProps = {
  message: Message;
  onMediaClick?: (messageId: string, index: number) => void;
};

const bubbleVariants = {
  initial: { opacity: 0, y: 8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function ChatBubbleInner({ message, onMediaClick }: ChatBubbleProps) {
  const { me, users } = useChatStore();
  const isMine = message.authorId === me?.id;
  const author = users[message.authorId];

  return (
    <motion.article
      layout
      initial={bubbleVariants.initial}
      animate={bubbleVariants.animate}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className={cn('flex w-full gap-3', isMine ? 'flex-row-reverse text-right' : 'text-left')}
      aria-live="polite"
    >
      {!isMine && (
        <img
          src={author?.avatar ?? '/avatars/placeholder.png'}
          alt={author?.name ?? 'Conversation partner'}
          className="mt-1 h-9 w-9 rounded-full border border-white/10 object-cover"
          loading="lazy"
        />
      )}
      <div className={cn('flex max-w-[80%] flex-col gap-2', isMine ? 'items-end' : 'items-start')}>
        {message.replyToId && (
          <span className="rounded-xl bg-white/5 px-3 py-1 text-[11px] text-white/70">Replying to a message</span>
        )}
        {message.text && (
          <div
            className={cn(
              'relative rounded-3xl px-4 py-2 text-sm shadow-lg shadow-black/30',
              isMine
                ? 'bg-gradient-to-br from-fuchsia-500/80 via-violet-500/80 to-indigo-500/80 text-white'
                : 'bg-white/8 text-white/90',
            )}
          >
            <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
          </div>
        )}
        {message.attachments?.length ? (
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
            {message.attachments.map((attachment, index) => (
              <button
                key={attachment.id}
                type="button"
                onClick={() => onMediaClick?.(message.id, index)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40"
                aria-label={`Open image ${index + 1} from ${author?.name ?? 'conversation'}`}
              >
                <img
                  src={attachment.thumb ?? attachment.url}
                  alt={attachment.alt ?? 'Shared image'}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  loading="lazy"
                />
                <span className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        ) : null}
        <span className="text-[11px] uppercase tracking-wide text-white/50">
          {formatTime(message.createdAt)}
          {isMine && (message.read ? ' · Read' : message.delivered ? ' · Sent' : ' · Sending…')}
        </span>
      </div>
    </motion.article>
  );
}

export const ChatBubble = memo(ChatBubbleInner);

export default ChatBubble;
