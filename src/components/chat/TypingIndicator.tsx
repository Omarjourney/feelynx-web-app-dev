import { motion } from 'framer-motion';

import { useChatStore } from '@/state/chatStore';

const dotVariants = {
  animate: {
    y: ['0%', '-30%', '0%'],
    transition: {
      duration: 1.1,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export type TypingIndicatorProps = {
  threadId: string;
};

export function TypingIndicator({ threadId }: TypingIndicatorProps) {
  const { typingByThread, me, users } = useChatStore();
  const ids = (typingByThread[threadId] ?? []).filter((id) => id !== me?.id);

  if (!ids.length) {
    return null;
  }

  const author = users[ids[0]];

  return (
    <div className="flex items-center gap-3 rounded-full bg-white/5 px-3 py-1 text-sm text-white/70" role="status" aria-live="polite">
      <span className="font-medium">{author?.name ?? 'Someone'} is typing</span>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-white/60"
            variants={dotVariants}
            animate="animate"
            transition={{ delay: index * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

export default TypingIndicator;
