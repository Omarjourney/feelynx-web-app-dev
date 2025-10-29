import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Play, Sparkles, Users } from 'lucide-react';
import ReactiveMascot from '@/components/ReactiveMascot';

const HERO_VIDEO = 'https://cdn.coverr.co/videos/coverr-lights-dancing-on-the-floor-2250/1080p.mp4';
const HERO_POSTER =
  'https://images.unsplash.com/photo-1603573355603-0ef3c08ebc31?auto=format&fit=crop&w=1600&q=80';

interface HeroSectionProps {
  onExplore?: () => void;
  onGoLive?: () => void;
}

const spotlightViewers = [
  { label: 'SkyTribe', count: 28 },
  { label: 'NeonFox Crew', count: 17 },
  { label: 'Velvet Room', count: 9 },
];

export const HeroSection = ({ onExplore, onGoLive }: HeroSectionProps) => {
  const [activeCrewIndex, setActiveCrewIndex] = useState(0);
  const activeCrew = useMemo(() => spotlightViewers[activeCrewIndex], [activeCrewIndex]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveCrewIndex((prev) => (prev + 1) % spotlightViewers.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-16">
      <div
        className="blurred-video-preview absolute inset-0"
        style={{ backgroundImage: `url(${HERO_POSTER})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" aria-hidden />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:flex-row md:items-stretch">
        <div className="flex-1 space-y-6 md:basis-2/3">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/50 shadow-glow">
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={HERO_POSTER}
              className="aspect-[16/9] w-full object-cover"
            >
              <source src={HERO_VIDEO} type="video/mp4" />
            </video>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

            <div className="absolute left-6 top-6 flex items-center gap-3 rounded-full bg-background/70 px-4 py-2 text-xs font-medium text-foreground shadow-premium">
              <Badge className="bg-live text-white animate-pulse">LIVE</Badge>
              <span className="flex items-center gap-1 text-sm font-semibold">
                <Users className="h-4 w-4 text-primary" /> 38,204 watching now
              </span>
            </div>

            <div className="absolute bottom-6 left-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="rounded-full bg-background/80 px-4 py-2 text-foreground shadow-premium">
                Neon Nights · Interactive show · Haptic synced
              </div>
              <div className="flex items-center gap-2 rounded-full bg-primary/80 px-4 py-2 text-primary-foreground shadow-glow">
                <Sparkles className="h-4 w-4" /> Swipe left/right to jump rooms
              </div>
            </div>

            <div className="absolute right-6 top-6 flex flex-col items-end gap-3 text-right">
              <div className="rounded-2xl bg-background/60 px-4 py-3 shadow-premium">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Featured Crew
                </p>
                <p className="text-base font-semibold text-foreground">{activeCrew.label}</p>
                <p className="text-xs text-muted-foreground">{activeCrew.count} fans cheering</p>
              </div>
              <div className="rounded-2xl bg-background/60 px-4 py-3 shadow-premium">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Interactive Toy
                </p>
                <p className="text-base font-semibold text-primary-foreground">Connected 💗</p>
                <p className="text-xs text-muted-foreground">Vibration synced to tips</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-center md:text-left">
            <div className="min-w-[160px] flex-1 rounded-3xl border border-primary/30 bg-background/80 p-4 shadow-premium">
              <p className="text-3xl font-bold text-primary-foreground">847k+</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Active Viewers
              </p>
            </div>
            <div className="min-w-[160px] flex-1 rounded-3xl border border-accent/30 bg-background/80 p-4 shadow-premium">
              <p className="text-3xl font-bold text-accent">25k+</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Creators</p>
            </div>
            <div className="min-w-[160px] flex-1 rounded-3xl border border-primary/30 bg-background/80 p-4 shadow-premium">
              <p className="text-3xl font-bold text-primary-foreground">$2.4M+</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Monthly Tips
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 md:basis-1/3">
          <div className="rounded-3xl border border-border/40 bg-background/80 p-6 shadow-premium backdrop-blur">
            <Badge variant="secondary" className="mb-3 bg-primary/30 text-primary-foreground">
              Creator Dashboard Snapshot
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight text-foreground">
              A cinematic welcome to your favorite performers.
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Dive into neon-lit shows, earn XP while you watch, and rally your crew to unlock
              exclusive goals.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                size="lg"
                className="button-ripple hover-glow w-full justify-between rounded-2xl bg-gradient-primary text-lg font-semibold text-primary-foreground"
                onClick={onExplore}
              >
                Start exploring <Play className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="w-full justify-between rounded-2xl border border-primary/40 text-lg text-primary"
                onClick={onGoLive}
              >
                Go live now <Flame className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-8 space-y-3 rounded-2xl border border-border/40 bg-background/60 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                <span>Milestone Goal</span>
                <span>5,000💎</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-muted/60">
                <div className="absolute inset-y-0 left-0 w-3/4 rounded-full bg-gradient-primary" />
              </div>
              <p className="text-xs text-muted-foreground">
                Help NeonFox unlock the outfit change goal tonight.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border/40 bg-background/60 p-5 shadow-premium">
            <ReactiveMascot
              mood="hype"
              message="Feely is hyped! Join a crew or start your own tribe."
              className="w-full"
            />
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="rounded-2xl bg-secondary/60 p-3">
                <p className="text-sm font-semibold text-foreground">Crews onboarding</p>
                <p>New members get boost multipliers for first tips.</p>
              </div>
              <div className="rounded-2xl bg-secondary/60 p-3">
                <p className="text-sm font-semibold text-foreground">Swipe-to-switch</p>
                <p>Swipe left/right on mobile for instant stream hopping.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
