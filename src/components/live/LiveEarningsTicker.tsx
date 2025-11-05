import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

type LiveEarningsTickerProps = {
  tokenEarnings: number;
  startTime: number | null;
  peakViewers: number;
};

export function LiveEarningsTicker({ tokenEarnings, startTime, peakViewers }: LiveEarningsTickerProps) {
  const [elapsed, setElapsed] = useState(() =>
    startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
  );

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }

    const interval = window.setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [startTime]);

  const formatted = useMemo(() => tokenEarnings.toLocaleString(), [tokenEarnings]);
  const duration = useMemo(() => formatDuration(elapsed), [elapsed]);

  return (
    <motion.section
      layout
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/10 p-5 text-sm text-white shadow-lg backdrop-blur-2xl',
        'ring-1 ring-white/20 hover:ring-fuchsia-400/40 transition-colors duration-300',
      )}
      aria-live="polite"
    >
      <div className="flex items-center gap-3 text-base font-semibold">
        <span className="text-lg">💎</span>
        <span>
          <span className="text-white/80">{formatted}</span>
          <span className="ml-1 text-white/50">tokens earned</span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-white/60">
        <span className="rounded-full bg-white/10 px-3 py-1 shadow-inner shadow-white/10">⏱ {duration}</span>
        <span className="rounded-full bg-white/10 px-3 py-1 shadow-inner shadow-white/10">
          👀 Peak {peakViewers.toLocaleString()}
        </span>
      </div>
    </motion.section>
  );
}

export default LiveEarningsTicker;
