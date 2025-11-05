import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useSpring } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

const SPRING_CONFIG = { stiffness: 220, damping: 24, mass: 0.6 };

const placeholderViewers = ['A', 'B', 'C', 'D', 'E'];

type LiveViewerBadgeProps = {
  isLive: boolean;
  viewerCount: number;
};

export function LiveViewerBadge({ isLive, viewerCount }: LiveViewerBadgeProps) {
  const spring = useSpring(viewerCount, SPRING_CONFIG);
  const [displayCount, setDisplayCount] = useState(viewerCount);

  useEffect(() => {
    spring.set(viewerCount);
  }, [viewerCount, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (value) => {
      setDisplayCount(Math.round(value));
    });
    return () => {
      unsubscribe?.();
    };
  }, [spring]);

  const viewerLabel = useMemo(
    () => `${displayCount.toLocaleString()} viewers`,
    [displayCount],
  );

  if (!isLive) {
    return null;
  }

  return (
    <AnimatePresence>
      <HoverCard openDelay={150} closeDelay={100}>
        <HoverCardTrigger asChild>
          <motion.span
            key="live-badge"
            layout
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="inline-flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-lg shadow-fuchsia-500/20 backdrop-blur-xl ring-1 ring-white/20"
            aria-live="polite"
          >
            <span className="flex h-2 w-2 items-center justify-center">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_12px_theme(colors.red.500)]" aria-hidden />
            </span>
            <span className="text-white/80">LIVE</span>
            <motion.span layout className="font-medium text-white">
              {viewerLabel}
            </motion.span>
          </motion.span>
        </HoverCardTrigger>
        <HoverCardContent
          side="left"
          align="end"
          className="w-56 space-y-3 rounded-2xl border border-white/10 bg-black/60 p-4 text-white shadow-xl backdrop-blur-2xl"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Top viewers</p>
          <div className="flex -space-x-2">
            {placeholderViewers.map((initial) => (
              <Avatar
                key={initial}
                className="h-10 w-10 border border-white/20 bg-white/10 text-white shadow-[0_0_18px_rgba(255,255,255,0.25)]"
              >
                <AvatarImage src={`/avatars/${initial.toLowerCase()}.png`} alt="Viewer avatar" />
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <p className="text-xs text-white/70">Hover to reveal more audience vibes.</p>
        </HoverCardContent>
      </HoverCard>
    </AnimatePresence>
  );
}

export default LiveViewerBadge;
