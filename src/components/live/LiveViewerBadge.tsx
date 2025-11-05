import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

import { useLiveStore } from '@/state/liveStore';
import { cn } from '@/lib/utils';

export type LiveViewerBadgeProps = {
  className?: string;
};

export function LiveViewerBadge({ className }: LiveViewerBadgeProps) {
  const { isLive, viewerCount } = useLiveStore((state) => ({
    isLive: state.isLive,
    viewerCount: state.viewerCount,
  }));

  const count = useMotionValue(viewerCount);
  const smoothCount = useSpring(count, { stiffness: 180, damping: 24 });
  const displayValue = useTransform(smoothCount, (value) => {
    const rounded = Math.max(0, Math.round(value ?? 0));
    return rounded.toLocaleString();
  });

  useEffect(() => {
    count.set(viewerCount);
  }, [viewerCount, count]);

  if (!isLive) {
    return null;
  }

  return (
    <motion.div
      layout
      aria-live="polite"
      className={cn(
        'pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/95 shadow-lg shadow-black/40 backdrop-blur-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50',
        className,
      )}
    >
      <span className="flex items-center gap-1">
        <span aria-hidden="true" className="text-base leading-none text-red-400">
          ●
        </span>
        LIVE
      </span>
      <motion.span className="text-white/80" data-testid="live-viewer-count">
        • <span className="tabular-nums">{displayValue}</span> viewers
      </motion.span>
    </motion.div>
  );
}

export default LiveViewerBadge;
