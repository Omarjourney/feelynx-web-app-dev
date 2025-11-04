import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import LiveBadge from '@/components/LiveBadge';
import type { Creator } from '@/types/creator';

interface CreatorCardProps {
  creator: Creator;
  onViewProfile?: (id: number) => void;
}

export const CreatorCard = ({ creator, onViewProfile }: CreatorCardProps) => {
  const gradientClass = creator.gradientColors || 'bg-gradient-to-br from-purple-600 to-pink-500';
  const subscriberLabel = creator.subscribers ?? '—';
  const videoRateLabel = creator.videoRate != null ? `${creator.videoRate}💎/min` : '—';
  const voiceRateLabel = creator.voiceRate != null ? `${creator.voiceRate}💎/min` : '—';
  const locationLabel = creator.country ? `📍 ${creator.country}` : '📍 Worldwide';
  const ageLabel = creator.age != null ? `🎂 ${creator.age}` : null;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="animate-feed-fade-in w-full h-full"
    >
      <Card className="group relative overflow-hidden border-white/5 bg-white/5 p-0 shadow-[0_35px_80px_-45px_rgba(15,15,30,0.9)] h-full flex flex-col">
        <CardContent className="flex h-full flex-col gap-0 p-0">
          <div className={cn('relative aspect-[3/4] w-full overflow-hidden', gradientClass)}>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10" />
            <div className="absolute inset-0 bg-gradient-glow opacity-70" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/75 via-black/20 to-transparent backdrop-blur-sm" />

            <div className="absolute left-3 sm:left-4 top-3 sm:top-4 flex items-center gap-1.5 sm:gap-2">
              {creator.isLive && <LiveBadge viewers={creator.viewers} />}
              {creator.tier && (
                <Badge className="glass-chip !border-white/20 !bg-white/5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-white/90">
                  {creator.tier}
                </Badge>
              )}
            </div>

            {creator.toyConnected && (
              <div className="absolute right-3 sm:right-4 top-3 sm:top-4 flex items-center gap-2">
                <span className="glass-chip animate-pulse-ring !border-pink-400/40 !bg-pink-500/15 text-[10px] sm:text-[11px] text-white">
                  💗 Connected
                </span>
              </div>
            )}

            <div className="absolute bottom-3 sm:bottom-4 lg:bottom-5 left-3 sm:left-4 lg:left-5 right-3 sm:right-4 lg:right-5 flex items-end justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="glow-ring flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full bg-gradient-primary/40">
                  <div className="flex h-9 w-9 sm:h-11 sm:w-11 lg:h-12 lg:w-12 items-center justify-center rounded-full bg-black/50 text-lg sm:text-xl lg:text-2xl font-semibold text-white">
                    {creator.initial}
                  </div>
                </div>
                <div>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-white drop-shadow">{creator.name}</p>
                  <p className="text-[11px] sm:text-xs text-white/70">@{creator.username}</p>
                </div>
              </div>
              <div className="text-right text-[10px] sm:text-xs text-white/80">
                <p>{locationLabel}</p>
                {ageLabel ? <p>{ageLabel}</p> : null}
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span className="glass-chip !px-2 sm:!px-2.5 !py-1 text-[10px] sm:text-xs">👥 {subscriberLabel}</span>
              <span
                className={cn(
                  'glass-chip !px-2 sm:!px-2.5 !py-1 text-[10px] sm:text-xs',
                  creator.isLive ? 'text-pink-200' : 'text-white/60',
                )}
              >
                {creator.isLive ? '⚡ Tipline open' : '🌙 Standby'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {creator.specialties.slice(0, 3).map((specialty, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border-white/15 bg-white/5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] text-white/70"
                >
                  {specialty}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm text-white/70">
              <div className="glass-elevated flex flex-col items-start gap-1 rounded-xl lg:rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-white/50">Video</span>
                <span className="text-sm sm:text-base font-semibold text-white">{videoRateLabel}</span>
              </div>
              <div className="glass-elevated flex flex-col items-start gap-1 rounded-xl lg:rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-white/50">Voice</span>
                <span className="text-sm sm:text-base font-semibold text-white">{voiceRateLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                size="lg"
                className="group/button flex-1 rounded-xl lg:rounded-2xl bg-gradient-primary text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-glow min-h-[48px] sm:min-h-[52px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 motion-safe:transition-transform motion-safe:duration-300 hover:-translate-y-0.5"
                onClick={() => onViewProfile?.(creator.id)}
                disabled={!onViewProfile}
              >
                {creator.isLive ? 'Enter Live' : 'Send Tip'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-[48px] w-[48px] sm:h-[52px] sm:w-[52px] rounded-xl lg:rounded-2xl border-white/15 bg-white/5 text-base sm:text-lg text-white/80 hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                💬
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
};
