import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SentimentTrend } from '../../api/ai/engagement';

type AnimationMode = 'calm' | 'focus' | 'hype' | 'reflective';

const meterBackground: Record<AnimationMode, string> = {
  calm: 'from-sky-500/20 via-sky-500/10 to-background',
  focus: 'from-violet-500/30 via-purple-500/10 to-background',
  hype: 'from-amber-500/40 via-rose-500/10 to-background',
  reflective: 'from-emerald-500/25 via-emerald-500/10 to-background',
};

const trendCopy: Record<SentimentTrend, string> = {
  up: 'Momentum rising',
  down: 'Cooling off',
  steady: 'Holding steady',
};

const trendEmoji: Record<SentimentTrend, string> = {
  up: '📈',
  down: '📉',
  steady: '⚖️',
};

interface ReactionMeterProps {
  score: number;
  mood: string;
  sentimentTrend: SentimentTrend;
  animationState?: AnimationMode;
}

export const ReactionMeter = ({
  score,
  mood,
  sentimentTrend,
  animationState = 'calm',
}: ReactionMeterProps) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const backgroundClass = meterBackground[animationState] ?? meterBackground.calm;

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-6 backdrop-blur', backgroundClass)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Engagement intensity</p>
          <p className="text-4xl font-semibold text-foreground">{clampedScore}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Mood</p>
          <p className="text-lg font-semibold capitalize text-foreground">{mood}</p>
          <Badge className="mt-2 bg-background/60 text-foreground shadow-sm">
            {trendEmoji[sentimentTrend]} {trendCopy[sentimentTrend]}
          </Badge>
        </div>
      </div>
      <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-black/20">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary via-fuchsia-500 to-amber-400"
          animate={{ width: `${clampedScore}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
      <AnimatePresence>
        {clampedScore > 90 && (
          <motion.span
            key="burst"
            className="absolute right-6 top-4 text-3xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1, rotate: -6 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            role="img"
            aria-label="High engagement"
          >
            🔥
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReactionMeter;
