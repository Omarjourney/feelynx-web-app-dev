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
    <section className="relative overflow-hidden bg-gradient-hero py-12 sm:py-16 lg:py-20 xl:py-24">
      <div
        className="blurred-video-preview absolute inset-0"
        style={{ backgroundImage: `url(${HERO_POSTER})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" aria-hidden />

      <div className="relative z-10 mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
          {/* Video and Stats Column */}
          <div className="flex-1 space-y-4 sm:space-y-6 lg:flex-[2]">
            <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl border border-white/10 bg-black/50 shadow-glow">
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={HERO_POSTER}
                className="aspect-video w-full object-cover"
              >
                <source src={HERO_VIDEO} type="video/mp4" />
              </video>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />

              <div className="absolute left-3 top-3 sm:left-4 sm:top-4 lg:left-6 lg:top-6 flex items-center gap-2 sm:gap-3 rounded-full bg-background/70 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-foreground shadow-premium backdrop-blur-sm">
                <Badge className="bg-live text-white animate-pulse text-xs">LIVE</Badge>
                <span className="hidden sm:flex items-center gap-1 text-sm font-semibold">
                  <Users className="h-4 w-4 text-primary" /> 38,204 watching now
                </span>
                <span className="sm:hidden flex items-center gap-1 text-xs font-semibold">
                  <Users className="h-3 w-3 text-primary" /> 38k
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 lg:bottom-6 lg:left-6 lg:right-6 flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="rounded-full bg-background/80 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-foreground shadow-premium backdrop-blur-sm">
                  <span className="hidden md:inline">Neon Nights · Interactive show · Haptic synced</span>
                  <span className="md:hidden">Interactive · Haptic</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-primary/80 px-3 py-1.5 sm:px-4 sm:py-2 text-primary-foreground shadow-glow backdrop-blur-sm">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" /> 
                  <span className="text-xs">Swipe to jump rooms</span>
                </div>
              </div>

              <div className="absolute right-3 top-3 sm:right-4 sm:top-4 lg:right-6 lg:top-6 hidden lg:flex flex-col items-end gap-3 text-right">
                <div className="rounded-2xl bg-background/60 px-4 py-3 shadow-premium backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Featured Crew
                  </p>
                  <p className="text-base font-semibold text-foreground">{activeCrew.label}</p>
                  <p className="text-xs text-muted-foreground">{activeCrew.count} fans cheering</p>
                </div>
                <div className="rounded-2xl bg-background/60 px-4 py-3 shadow-premium backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Interactive Toy
                  </p>
                  <p className="text-base font-semibold text-primary-foreground">Connected 💗</p>
                  <p className="text-xs text-muted-foreground">Vibration synced to tips</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <div className="rounded-2xl lg:rounded-3xl border border-primary/30 bg-background/80 p-3 sm:p-4 lg:p-6 shadow-premium backdrop-blur-sm text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-foreground">847k+</p>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground mt-1">
                  <span className="hidden sm:inline">Active</span> Viewers
                </p>
              </div>
              <div className="rounded-2xl lg:rounded-3xl border border-accent/30 bg-background/80 p-3 sm:p-4 lg:p-6 shadow-premium backdrop-blur-sm text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-accent">25k+</p>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground mt-1">Creators</p>
              </div>
              <div className="rounded-2xl lg:rounded-3xl border border-primary/30 bg-background/80 p-3 sm:p-4 lg:p-6 shadow-premium backdrop-blur-sm text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-foreground">$2.4M+</p>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground mt-1">
                  <span className="hidden sm:inline">Monthly</span> Tips
                </p>
              </div>
            </div>
          </div>

          {/* CTA and Info Column */}
          <div className="flex-1 space-y-4 sm:space-y-6 lg:flex-1">
            <div className="rounded-2xl lg:rounded-3xl border border-border/40 bg-background/80 p-5 sm:p-6 lg:p-8 shadow-premium backdrop-blur-sm">
              <Badge variant="secondary" className="mb-3 sm:mb-4 bg-primary/30 text-primary-foreground text-xs">
                Creator Dashboard Snapshot
              </Badge>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight text-foreground">
                A cinematic welcome to your favorite performers.
              </h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-muted-foreground max-w-prose">
                Dive into neon-lit shows, earn XP while you watch, and rally your crew to unlock
                exclusive goals.
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:gap-4">
                <Button
                  size="lg"
                  className="button-ripple hover-glow w-full justify-between rounded-2xl bg-gradient-primary text-base sm:text-lg font-semibold text-primary-foreground min-h-[48px] sm:min-h-[52px] px-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 motion-safe:transition-all motion-safe:duration-300"
                  onClick={onExplore}
                >
                  Start exploring <Play className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full justify-between rounded-2xl border border-primary/40 text-base sm:text-lg text-primary min-h-[48px] sm:min-h-[52px] px-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 motion-safe:transition-all motion-safe:duration-300"
                  onClick={onGoLive}
                >
                  Go live now <Flame className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-6 sm:mt-8 space-y-3 rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur-sm">
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

            <div className="rounded-2xl lg:rounded-3xl border border-border/40 bg-background/60 p-4 sm:p-5 lg:p-6 shadow-premium backdrop-blur-sm">
              <ReactiveMascot
                mood="hype"
                message="Feely is hyped! Join a crew or start your own tribe."
                className="w-full"
              />
              <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 text-xs text-muted-foreground">
                <div className="rounded-xl lg:rounded-2xl bg-secondary/60 p-3 backdrop-blur-sm">
                  <p className="text-xs sm:text-sm font-semibold text-foreground">Crews onboarding</p>
                  <p className="text-[11px] sm:text-xs mt-1">New members get boost multipliers for first tips.</p>
                </div>
                <div className="rounded-xl lg:rounded-2xl bg-secondary/60 p-3 backdrop-blur-sm">
                  <p className="text-xs sm:text-sm font-semibold text-foreground">Swipe-to-switch</p>
                  <p className="text-[11px] sm:text-xs mt-1">Swipe left/right on mobile for instant stream hopping.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
