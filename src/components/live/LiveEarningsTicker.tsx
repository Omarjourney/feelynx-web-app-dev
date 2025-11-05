import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { useLiveStore } from '@/state/liveStore';
import { cn } from '@/lib/utils';

export type LiveEarningsTickerProps = {
  className?: string;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const segments = [hours, minutes, seconds].map((value) => value.toString().padStart(2, '0'));
  return `${segments[0]}:${segments[1]}:${segments[2]}`;
}

export function LiveEarningsTicker({ className }: LiveEarningsTickerProps) {
  const { tokenEarnings, startTime, peakViewers, viewerCount } = useLiveStore((state) => ({
    tokenEarnings: state.tokenEarnings,
    startTime: state.startTime,
    peakViewers: state.peakViewers,
    viewerCount: state.viewerCount,
  }));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startTime) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [startTime]);

  const elapsed = useMemo(() => {
    if (!startTime) return '00:00:00';
    return formatDuration(now - startTime);
  }, [now, startTime]);

  return (
    <motion.section
      layout
      aria-live="polite"
      className={cn(
        'flex w-full flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/15 bg-white/7 px-6 py-4 text-sm text-white/90 shadow-lg shadow-black/40 backdrop-blur-2xl',
        className,
      )}
    >
      <div className="flex items-center gap-3 text-base font-semibold text-white">
        <span aria-hidden="true" className="text-xl">💎</span>
        <span className="tabular-nums">{tokenEarnings.toLocaleString()}</span>
        <span className="text-sm font-medium uppercase tracking-widest text-white/60">tokens earned</span>
      </div>
      <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-wide text-white/70">
        <span className="flex items-center gap-1">
          <span aria-hidden="true">⏱</span>
          <span className="tabular-nums">{elapsed}</span>
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden="true">📈</span>
          Peak {peakViewers.toLocaleString()} viewers
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden="true">👀</span>
          Now {viewerCount.toLocaleString()} watching
        </span>
      </div>
    </motion.section>
  );
}

export default LiveEarningsTicker;
