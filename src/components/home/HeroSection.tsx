import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LiveIndicator } from './LiveIndicator';

type StatCard = {
  title: string;
  value: ReactNode;
  description: string;
};

type HeroSectionProps = {
  onPrimaryCta: () => void;
  onSecondaryCta: () => void;
  stats: StatCard[];
};

export function HeroSection({ onPrimaryCta, onSecondaryCta, stats }: HeroSectionProps) {
  return (
    <motion.section
      aria-labelledby="hero-intro"
      className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.08] p-8 shadow-premium backdrop-blur-xl md:p-12"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl" aria-hidden />
      <div className="relative flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-6">
          <LiveIndicator label="Immersive streaming" />
          <div className="space-y-4">
            <h1 id="hero-intro" className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              A premium glassmorphism home for your live vibes
            </h1>
            <p className="max-w-xl text-base text-white/75">
              Seamlessly browse live creators, curated crews, and Lovense-powered shows inside a focused experience crafted for retention.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-glow"
              onClick={onPrimaryCta}
            >
              Launch creator studio
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 hover:text-white"
              onClick={onSecondaryCta}
            >
              Discover experiences
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-white/70 md:text-base">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="glass-elevated min-w-[160px] rounded-3xl border border-white/10 bg-white/10 p-5"
            >
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/55">{stat.title}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-white/65">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
