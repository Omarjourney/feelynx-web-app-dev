import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LiveBadgeProps {
  viewers?: number | null;
  className?: string;
}

const LiveBadge = ({ viewers, className }: LiveBadgeProps) => {
  return (
    <motion.span
      layout
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className={cn(
        'relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-[#e8338b]/75 via-[#ff5fa2]/70 to-[#9f2fff]/75 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.35em] text-white shadow-glow backdrop-blur',
        className,
      )}
      role="status"
      aria-label={
        typeof viewers === 'number' && viewers > 0
          ? `Live with ${viewers} viewers watching`
          : 'Live now'
      }
    >
      <span className="relative flex h-3 w-3 items-center justify-center">
        <span className="absolute h-full w-full rounded-full bg-[#ff6b9c]/70 blur-sm" aria-hidden />
        <span className="relative h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
      </span>
      <span>Live</span>
      {typeof viewers === 'number' && viewers > 0 && (
        <span className="text-[9px] font-semibold tracking-[0.2em] text-white/75">
          {viewers.toLocaleString()} watching
        </span>
      )}
      <span
        className="pointer-events-none absolute inset-0 rounded-full border border-pink-400/40"
        aria-hidden
      />
    </motion.span>
  );
};

export default LiveBadge;
