import { motion } from 'framer-motion';
import LiveBadge from '@/components/LiveBadge';
import { cn } from '@/lib/utils';

export interface CreatorCardProps {
  name: string;
  live?: boolean;
  thumbnail: string;
  earnings?: string;
  onSelect?: () => void;
}

export const CreatorCard = ({ name, live, thumbnail, earnings, onSelect }: CreatorCardProps) => {
  return (
    <motion.button
      type="button"
      layout
      whileHover={{ scale: 1.02 }}
      whileFocus={{ scale: 1.01 }}
      onClick={onSelect}
      className={cn(
        'glass-card group relative flex h-full flex-col overflow-hidden rounded-3xl text-left shadow-lg transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'hover:bg-white/10'
      )}
      aria-label={`${name}${live ? ' is live' : ''}`.trim()}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
        <img
          src={thumbnail}
          alt={`${name} thumbnail`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {live && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
            <span className="h-2 w-2 rounded-full bg-red-400" aria-hidden />
            Live now
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">{name}</h3>
          {earnings && (
            <p className="text-sm text-foreground/70" aria-label={`Earnings ${earnings}`}>
              Earnings: <span className="font-medium text-primary">{earnings}</span>
            </p>
          )}
        </div>
        {live ? (
          <LiveBadge className="w-full justify-center" label="LIVE with Lovense" />
        ) : (
          <span className="inline-flex items-center justify-center rounded-full border border-white/10 px-4 py-2 text-sm text-foreground/70">
            Offline replay
          </span>
        )}
      </div>
    </motion.button>
  );
};
