import { MutableRefObject, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { EmotionTone, EmotionBurst } from '@/hooks/useEmotionUI';

interface LiveVideoPanelProps {
  isConnected: boolean;
  onConnect: () => void;
  onOpenTip: () => void;
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  coinBalance: number;
  milestoneProgress: number;
  milestoneGoal: number;
  reactions: Array<{ id: number; icon: string; color: string }>;
  topFans: Array<{ name: string; amount: number }>;
  thanksMessage: string | null;
  toyConnected: boolean;
  tone?: EmotionTone;
  glassStyles?: CSSProperties;
  quietMode?: boolean;
  emotionBursts?: EmotionBurst[];
  onBurstComplete?: (id: number) => void;
}

const LiveVideoPanel = ({
  isConnected,
  onConnect,
  onOpenTip,
  videoRef,
  coinBalance,
  milestoneProgress,
  milestoneGoal,
  reactions,
  topFans,
  thanksMessage,
  toyConnected,
  tone = 'violet',
  glassStyles,
  quietMode,
  emotionBursts = [],
  onBurstComplete,
}: LiveVideoPanelProps) => {
  const progressPercent = Math.min(100, Math.round((milestoneProgress / milestoneGoal) * 100));
  const toneRing =
    tone === 'warm'
      ? 'border-pink-400/30 shadow-[0_0_80px_rgba(255,120,190,0.28)]'
      : tone === 'cool'
        ? 'border-sky-400/25 shadow-[0_0_80px_rgba(82,145,255,0.24)]'
        : 'border-violet-400/25 shadow-[0_0_80px_rgba(168,132,255,0.28)]';

  return (
    <Card
      className={cn(
        'rounded-card border bg-neutral-900/60 shadow-base transition-shadow duration-500 backdrop-blur-md',
        toneRing,
      )}
      style={glassStyles}
    >
      <CardContent className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-card bg-black md:h-[75vh]">
          <video ref={videoRef} className="h-full w-full object-cover rounded-card" autoPlay playsInline>
            <track kind="captions" srcLang="en" label="auto" />
          </video>

          {!isConnected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-primary/15 to-primary-glow/10 text-center">
              <div className="text-6xl opacity-50">📹</div>
              <Button
                onClick={onConnect}
                className="button-ripple bg-gradient-primary text-primary-foreground hover:shadow-glow"
              >
                Connect to Live Stream
              </Button>
              <p className="text-sm text-muted-foreground">Click to join the live video stream</p>
            </div>
          )}

          {quietMode ? (
            <div className="pointer-events-none absolute inset-0 bg-slate-900/35 backdrop-blur-sm transition-all duration-500" aria-hidden />
          ) : null}

          <div className="absolute left-4 top-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="rounded-full bg-background/70 px-3 py-1 text-foreground shadow-base">
              Balance{' '}
              <span className="font-semibold text-primary-foreground">
                💎 {coinBalance.toLocaleString()}
              </span>
            </div>
            <div className="rounded-full bg-background/70 px-3 py-1 shadow-base">
              {toyConnected ? 'Interactive Toy Connected 💗' : 'Toy offline'}
            </div>
          </div>

          <div className="absolute right-4 top-4 flex flex-col gap-2 text-right text-xs text-muted-foreground">
            <div className="rounded-2xl bg-background/70 px-3 py-2 shadow-base">
              <p className="uppercase tracking-widest">Top fans</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground">
                {topFans.map((fan, index) => (
                  <li key={fan.name} className="flex items-center justify-between gap-3">
                    <span className="font-medium">
                      #{index + 1} {fan.name}
                    </span>
                    <span className="text-primary-foreground">{fan.amount.toLocaleString()}💎</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 space-y-3">
            <div className="rounded-3xl bg-background/70 px-4 py-3 shadow-base">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>Milestone goal</span>
                <span>
                  {milestoneProgress.toLocaleString()} / {milestoneGoal.toLocaleString()}💎
                </span>
              </div>
              <Progress value={progressPercent} className="mt-2 h-2 bg-background/60">
                <div className="infinite-progress absolute inset-y-0 left-0 w-16 bg-primary/40" aria-hidden />
              </Progress>
            </div>

            {thanksMessage && (
              <div className="flex items-center justify-center text-sm font-semibold text-primary-foreground">
                {thanksMessage}
              </div>
            )}

            {isConnected && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="rounded-button shadow-glow motion-safe:transition-transform motion-safe:duration-200 hover:scale-105">
                    🎤 Mute
                  </Button>
                  <Button variant="secondary" size="sm" className="rounded-button shadow-glow motion-safe:transition-transform motion-safe:duration-200 hover:scale-105">
                    📹 Camera Off
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={onOpenTip} className="rounded-button shadow-glow motion-safe:transition-transform motion-safe:duration-200 hover:scale-105">
                    💝 Tip
                  </Button>
                  <Button variant="secondary" size="sm" className="rounded-button shadow-glow motion-safe:transition-transform motion-safe:duration-200 hover:scale-105">
                    🎮 Control Toy
                  </Button>
                </div>
              </div>
            )}
          </div>

          {reactions.map((reaction) => (
            <div
              key={reaction.id}
              className="reaction-pop pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 text-3xl"
              style={{ color: reaction.color }}
              aria-hidden
            >
              {reaction.icon}
            </div>
          ))}
          <AnimatePresence>
            {emotionBursts.map((burst) => (
              <motion.span
                key={burst.id}
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                animate={{ opacity: 1, y: -80, scale: 1.2 }}
                exit={{ opacity: 0, y: -120 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                className="pointer-events-none absolute bottom-20 text-4xl drop-shadow-[0_6px_18px_rgba(255,255,255,0.35)]"
                style={{ left: `${10 + burst.left * 80}%`, rotate: `${burst.rotation}deg` }}
                onAnimationComplete={() => onBurstComplete?.(burst.id)}
                aria-hidden
              >
                {burst.emoji}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveVideoPanel;
