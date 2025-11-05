import { memo } from 'react';
import { motion } from 'framer-motion';

import LiveEarningsTicker from './LiveEarningsTicker';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
  live: 'from-[#F012BE]/70 via-[#8E2DE2]/70 to-[#120458]/70',
  idle: 'from-slate-800/70 via-slate-900/70 to-black/70',
} satisfies Record<string, string>;

const SENTIMENT_LABELS = [
  { threshold: 0.45, label: '⚠️ Rebuild trust' },
  { threshold: 0.6, label: '🙂 Steady vibe' },
  { threshold: 0.75, label: '😊 Warm energy' },
  { threshold: 0.9, label: '🔥 Electric chemistry' },
];

type LiveExperienceHUDProps = {
  viewerCount: number;
  peakViewers: number;
  tokenTotal: number;
  tokensPerMinute: number;
  latencyMs: number;
  engagementRate: number;
  sentimentScore: number;
  sessionStart: number | null;
  suggestions: string[];
  isLive: boolean;
  cameraOn: boolean;
  onGoLive: () => void;
  onEnd: () => void;
  onToggleCamera: () => void;
};

function formatPercentage(value: number) {
  return `${Math.round(value * 100)}%`;
}

function getSentimentLabel(score: number) {
  const match = SENTIMENT_LABELS.find((item) => score < item.threshold);
  return match?.label ?? '💖 Magnetic connection';
}

const LiveExperienceHUD = memo(
  ({
    viewerCount,
    peakViewers,
    tokenTotal,
    tokensPerMinute,
    latencyMs,
    engagementRate,
    sentimentScore,
    sessionStart,
    suggestions,
    isLive,
    cameraOn,
    onGoLive,
    onEnd,
    onToggleCamera,
  }: LiveExperienceHUDProps) => {
    const accentColor = isLive ? STATUS_COLORS.live : STATUS_COLORS.idle;

    return (
      <motion.section
        layout
        className={cn(
          'relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br p-6 text-white shadow-2xl',
          'backdrop-blur-2xl transition-shadow duration-500 hover:shadow-[0_0_30px_rgba(240,18,190,0.45)]',
          accentColor,
        )}
        aria-live="polite"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#F012BE22,transparent_45%)]" />
        <div className="relative z-10 flex flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Feelynx — Feel Every Moment</p>
              <h2 className="text-2xl font-semibold text-white">Creator Control Orbit</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80">
              <span className="inline-flex h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_12px_rgba(240,18,190,0.75)]" />
              {isLive ? 'Live' : 'Standby'} • {cameraOn ? 'Camera On' : 'Camera Off'}
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <motion.article
              layout
              className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-inner shadow-black/20 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Real-time audience</p>
              <p className="mt-2 text-3xl font-bold text-white">{viewerCount.toLocaleString()}</p>
              <p className="text-xs text-white/70">Peak {peakViewers.toLocaleString()} viewers</p>
            </motion.article>
            <motion.article
              layout
              className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-inner shadow-black/20 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Engagement pulse</p>
              <p className="mt-2 text-3xl font-bold text-white">{formatPercentage(engagementRate)}</p>
              <p className="text-xs text-white/70">{getSentimentLabel(sentimentScore)}</p>
            </motion.article>
            <motion.article
              layout
              className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-inner shadow-black/20 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Latency</p>
              <p className="mt-2 text-3xl font-bold text-white">{latencyMs} ms</p>
              <p className="text-xs text-white/70">Target &lt; 300 ms</p>
            </motion.article>
          </div>

          <LiveEarningsTicker tokenEarnings={tokenTotal} startTime={sessionStart} peakViewers={peakViewers} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
            <motion.div
              layout
              className="flex flex-col gap-3 rounded-3xl border border-white/15 bg-white/10 p-4 shadow-inner shadow-black/20 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">AI reaction cues</p>
                <span className="text-xs text-white/60">Tokens/min {tokensPerMinute.toLocaleString()}</span>
              </div>
              <ul className="grid gap-2 md:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/15 via-white/5 to-transparent px-4 py-3 text-sm text-white/90 shadow-sm"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              layout
              className="flex flex-col justify-between gap-3 rounded-3xl border border-white/15 bg-white/10 p-4 text-sm text-white shadow-inner shadow-black/20 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Stream controls</p>
              <div className="grid gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="bg-[#F012BE] text-white hover:bg-[#F012BE]/80"
                  onClick={onGoLive}
                  disabled={isLive}
                >
                  Go Live
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#F012BE]/50 text-white hover:bg-[#F012BE]/10"
                  onClick={onEnd}
                  disabled={!isLive}
                >
                  End Stream
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={onToggleCamera}
                >
                  {cameraOn ? 'Disable Camera' : 'Enable Camera'}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    );
  },
);

LiveExperienceHUD.displayName = 'LiveExperienceHUD';

export default LiveExperienceHUD;
