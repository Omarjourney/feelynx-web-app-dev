import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

export type LiveReactionsProps = {
  onReact?: (emoji: string) => void;
  disabled?: boolean;
  container?: HTMLElement | null;
  className?: string;
};

type ReactionBurst = {
  id: number;
  emoji: string;
  left: number;
};

const REACTIONS = ['❤️', '🔥', '😂', '😍', '🫶'] as const;
const REACTION_COOLDOWN = 350;

export function LiveReactions({ onReact, disabled, container, className }: LiveReactionsProps) {
  const [bursts, setBursts] = useState<ReactionBurst[]>([]);
  const lastSentRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);

  const emitBurst = useCallback(
    (emoji: string) => {
      const now = Date.now();
      if (now - lastSentRef.current < REACTION_COOLDOWN) {
        return;
      }
      lastSentRef.current = now;
      onReact?.(emoji);
      const burst: ReactionBurst = {
        id: now + Math.random(),
        emoji,
        left: 15 + Math.random() * 70,
      };
      setBursts((current) => [...current.slice(-12), burst]);
      const timeout = window.setTimeout(() => {
        setBursts((current) => current.filter((item) => item.id !== burst.id));
      }, 1800);
      timeoutsRef.current.push(timeout);
    },
    [onReact],
  );

  useEffect(() => () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const renderOverlay = useMemo(() => {
    if (!container) return null;
    return createPortal(
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <AnimatePresence>
          {bursts.map((burst) => (
            <motion.span
              key={burst.id}
              initial={{ opacity: 0, y: 40, scale: 0.6 }}
              animate={{ opacity: 1, y: -220, scale: 1 }}
              exit={{ opacity: 0, y: -260, scale: 0.8 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ left: `${burst.left}%` }}
              className="absolute bottom-8 text-3xl drop-shadow-lg"
            >
              {burst.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>,
      container,
    );
  }, [bursts, container]);

  return (
    <Fragment>
      {renderOverlay}
      <div
        className={cn(
          'flex w-full items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-3 text-2xl text-white/90 shadow-inner shadow-fuchsia-500/10 backdrop-blur-xl',
          disabled && 'opacity-50',
          className,
        )}
        aria-label="Live reactions"
      >
        {REACTIONS.map((reaction) => (
          <button
            key={reaction}
            type="button"
            disabled={disabled}
            aria-label={`Send reaction: ${reaction}`}
            onClick={() => emitBurst(reaction)}
            className="rounded-full bg-white/0 px-3 py-1 text-2xl transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70"
          >
            {reaction}
          </button>
        ))}
      </div>
    </Fragment>
  );
}

export default LiveReactions;
