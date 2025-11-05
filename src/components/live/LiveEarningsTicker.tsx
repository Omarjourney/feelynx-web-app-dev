import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { EarningsArc } from './EarningsArc';
import type { EmotionTone } from '@/hooks/useEmotionUI';

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
  tone?: EmotionTone;
  glassStyles?: CSSProperties;
};

export function LiveEarningsTicker({ tokenEarnings, startTime, peakViewers, tone = 'violet', glassStyles }: LiveEarningsTickerProps) {
  const [elapsed, setElapsed] = useState(() => (startTime ? Math.floor((Date.now() - startTime) / 1000) : 0));

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

  const toneClass =
    tone === 'warm'
      ? 'ring-pink-400/40'
      : tone === 'cool'
        ? 'ring-sky-400/30'
        : 'ring-violet-400/35';

  return (
    <motion.section
      layout
      className={cn(
        'flex flex-wrap items-center justify-between gap-6 rounded-3xl border p-5 text-sm text-white shadow-lg backdrop-blur-2xl',
        'transition-colors duration-500',
        toneClass,
      )}
      aria-live="polite"
      style={glassStyles}
    >
      <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-white/60">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">⏱ {duration}</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          👀 Peak {peakViewers.toLocaleString()}
        </span>
      </div>
      <div className="flex flex-1 items-center justify-end gap-6">
        <div className="text-right text-base font-semibold">
          <div className="text-lg text-white/80">💎 {formatted}</div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">live session earnings</p>
        </div>
        <EarningsArc value={tokenEarnings} />
      </div>
    </motion.section>
  );
}

export default LiveEarningsTicker;
