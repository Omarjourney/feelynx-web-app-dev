import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';

const REACTIONS = ['❤️', '🔥', '😂', '😍', '🫶'];
const RATE_LIMIT_MS = 400;

export type LiveReactionsProps = {
  onSend: (emoji: string) => void;
  disabled?: boolean;
};

type Burst = {
  id: number;
  emoji: string;
};

export function LiveReactions({ onSend, disabled }: LiveReactionsProps) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const lastSentRef = useRef<number>(0);

  const handleReaction = useCallback(
    (emoji: string) => {
      const now = Date.now();
      if (now - lastSentRef.current < RATE_LIMIT_MS) return;
      lastSentRef.current = now;
      onSend(emoji);
      setBursts((current) => [...current, { id: now, emoji }].slice(-20));
    },
    [onSend],
  );

  const buttons = useMemo(
    () =>
      REACTIONS.map((emoji) => (
        <Button
          key={emoji}
          type="button"
          size="sm"
          onClick={() => handleReaction(emoji)}
          disabled={disabled}
          className="relative rounded-full bg-white/10 px-4 py-2 text-lg text-white shadow-md shadow-fuchsia-500/20 transition-all duration-200 hover:bg-white/20 hover:shadow-fuchsia-400/30 focus-visible:ring-2 focus-visible:ring-fuchsia-400"
          aria-label={`Send reaction: ${emoji}`}
        >
          {emoji}
        </Button>
      )),
    [disabled, handleReaction],
  );

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-3" aria-label="Quick reactions">
        {buttons}
      </div>
      <AnimatePresence>
        {bursts.map((burst) => (
          <motion.span
            key={burst.id}
            initial={{ opacity: 0.8, y: 0, scale: 0.9 }}
            animate={{ opacity: 0, y: -120, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 select-none text-3xl"
            onAnimationComplete={() => {
              setBursts((current) => current.filter((item) => item.id !== burst.id));
            }}
            aria-hidden
          >
            {burst.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default LiveReactions;
