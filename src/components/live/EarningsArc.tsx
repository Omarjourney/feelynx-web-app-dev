import { useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const ARC_RADIUS = 48;
const CIRCUMFERENCE = 2 * Math.PI * ARC_RADIUS;

export type EarningsArcProps = {
  value: number;
  target?: number;
  label?: string;
};

export function EarningsArc({ value, target = 5000, label = 'session growth' }: EarningsArcProps) {
  const rawProgress = Math.min(1, Math.max(0, value / target));
  const progress = useMotionValue(rawProgress);
  const eased = useSpring(progress, { stiffness: 120, damping: 18, mass: 0.4 });

  useEffect(() => {
    progress.set(rawProgress);
  }, [progress, rawProgress]);

  return (
    <div className="relative flex items-center gap-4 text-white/80">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 120 120" className="h-full w-full">
          <defs>
            <linearGradient id="earnings-arc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff9ad6" />
              <stop offset="50%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <circle
            cx="60"
            cy="60"
            r={ARC_RADIUS}
            fill="transparent"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={10}
            strokeDasharray={CIRCUMFERENCE}
          />
          <motion.circle
            cx="60"
            cy="60"
            r={ARC_RADIUS}
            fill="transparent"
            stroke="url(#earnings-arc)"
            strokeLinecap="round"
            strokeWidth={10}
            strokeDasharray={CIRCUMFERENCE}
            style={{ pathLength: eased }}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase tracking-[0.2em] text-white/60">{label}</span>
          <span className="text-lg font-semibold text-white">{Math.round(rawProgress * 100)}%</span>
        </div>
      </div>
      <div className="space-y-1 text-xs uppercase tracking-[0.25em] text-white/60">
        <p>💎 {value.toLocaleString()} tokens</p>
        <p>Target {target.toLocaleString()}</p>
        <motion.div
          className="h-1 w-24 rounded-full bg-white/10"
          style={{
            boxShadow: '0 0 24px rgba(244, 114, 182, calc(var(--glow-intensity, 0.4) * 0.45))',
          }}
        >
          <motion.div
            className="h-1 rounded-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400"
            style={{ width: eased.to((val) => `${Math.min(100, Math.max(8, val * 100))}%`) }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default EarningsArc;
