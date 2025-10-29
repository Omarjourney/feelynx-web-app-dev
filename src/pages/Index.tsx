import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { SearchFilters, SearchFiltersState } from '@/components/SearchFilters';
import { CreatorCard } from '@/components/CreatorCard';
import { VibeCoinPackages } from '@/components/VibeCoinPackages';
import { useCreatorLive } from '@/hooks/useCreatorLive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { groups } from '@/data/groups';

const Index = () => {
  const creators = useCreatorLive();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFiltersState>({
    search: '',
    country: 'all',
    specialty: 'all',
    isLive: false,
    sort: 'trending',
  });

  const parseCount = (value?: string) => {
    if (!value) return 0;
    const normalized = value.trim().toLowerCase();
    const numeric = Number.parseFloat(normalized.replace(/[^0-9.]/g, ''));
    if (Number.isNaN(numeric)) return 0;
    if (normalized.endsWith('m')) return numeric * 1_000_000;
    if (normalized.endsWith('k')) return numeric * 1_000;
    return numeric;
  };

  const filteredCreators = useMemo(() => {
    return creators
      .filter((c) =>
        filters.search ? c.name.toLowerCase().includes(filters.search.toLowerCase()) : true,
      )
      .filter((c) => (filters.country === 'all' ? true : c.country === filters.country))
      .filter((c) =>
        filters.specialty === 'all' ? true : c.specialties?.includes(filters.specialty),
      )
      .filter((c) => (filters.isLive ? c.isLive : true))
      .sort((a, b) => {
        if (filters.sort === 'newest') return b.id - a.id;
        if (filters.sort === 'followers')
          return parseCount(b.subscribers) - parseCount(a.subscribers);
        return (b.viewers || 0) - (a.viewers || 0);
      });
  }, [creators, filters]);

  const liveCreators = filteredCreators.filter((c) => c.isLive).slice(0, 8);
  const featuredCreators = filteredCreators.slice(0, 12);

  const handleViewProfile = (creatorId: number) => {
    const creator = creators.find((c) => c.id === creatorId);
    if (creator?.isLive) {
      navigate(`/live/${creator.username}`);
    }
  };

  const handleFiltersChange = (newFilters: Partial<SearchFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="min-h-screen bg-background md:flex">
      <Navigation activeTab="home" onTabChange={() => undefined} />
      <main id="main-content" className="flex-1 overflow-x-hidden pb-24 md:pb-12">
        <HeroSection
          onExplore={() => navigate('/discover')}
          onGoLive={() => navigate('/call-room')}
        />

        <section className="mx-auto mt-12 w-full max-w-6xl space-y-6 px-4">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="border border-border/60 bg-background/80 backdrop-blur">
              <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-2xl font-semibold">Discover live creators</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Use smart filters to find the perfect vibe. Swipe on mobile to jump instantly
                    between shows.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="button-ripple"
                  onClick={() => navigate('/creators')}
                >
                  Open full directory
                </Button>
              </CardHeader>
              <CardContent>
                <SearchFilters {...filters} onChange={handleFiltersChange} />
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-background/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  Smart onboarding
                  <span className="text-xs font-medium text-primary">Guided</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-primary/30 bg-primary/10 p-3">
                  <p className="font-semibold text-primary-foreground">Step 1 · Join / Sign in</p>
                  <p>Earn double XP on your first login each day.</p>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-background/60 p-3">
                  <p className="font-semibold text-foreground">Step 2 · Choose your vibe</p>
                  <p>Pick a crew or swipe Discover to see trending tribes.</p>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-background/60 p-3">
                  <p className="font-semibold text-foreground">Step 3 · Go live</p>
                  <p>Follow the guided checklist for cams, Lovense, and token goals.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <section aria-labelledby="live-now" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="live-now" className="text-3xl font-bold text-foreground">
                🔴 Live right now
              </h2>
              <Button variant="ghost" onClick={() => navigate('/creators')}>
                View all live
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {liveCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} onViewProfile={handleViewProfile} />
              ))}
            </div>
          </section>

          <section aria-labelledby="featured-creators" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="featured-creators" className="text-3xl font-bold text-foreground">
                Featured crews & creators
              </h2>
              <Button variant="ghost" onClick={() => navigate('/groups')}>
                Explore crews
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featuredCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} onViewProfile={handleViewProfile} />
              ))}
            </div>
          </section>

          <section aria-labelledby="crew-spotlight" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="crew-spotlight" className="text-3xl font-bold text-foreground">
                Crew spotlights
              </h2>
              <Button variant="ghost" onClick={() => navigate('/groups')}>
                Join a crew
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.slice(0, 6).map((group) => (
                <div
                  key={group.id}
                  className="rounded-3xl border border-border/60 bg-background/60 p-4 shadow-premium"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{group.name}</p>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        Crew · {group.members.toLocaleString()} members
                      </p>
                    </div>
                    {group.isLive && (
                      <span className="rounded-full bg-live px-3 py-1 text-xs font-semibold text-white animate-pulse">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {group.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Daily quests ready</span>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-primary-foreground">
                      +150 XP
                    </span>
                  </div>
                  <Button
                    className="button-ripple mt-4 w-full"
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    Enter crew space
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="rewards" className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Card className="border border-border/60 bg-background/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Gamified rewards</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground shadow-premium">
                  <p className="text-lg font-bold">Level 12</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Viewer XP
                  </p>
                  <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-muted/60">
                    <div className="absolute inset-y-0 left-0 w-[68%] rounded-full bg-gradient-primary" />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    320 XP to unlock "Big Spender" badge.
                  </p>
                </div>
                <div className="rounded-3xl border border-accent/30 bg-accent/10 p-4 text-sm text-foreground shadow-premium">
                  <p className="text-lg font-bold">Streak · 6 days</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Login bonus
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Spin the Lucky Wheel for multipliers after Day 7.
                  </p>
                </div>
                <div className="rounded-3xl border border-border/40 bg-background/70 p-4 text-sm text-foreground shadow-premium">
                  <p className="text-lg font-bold">PK Battles</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Tonight 9 PM
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Watch NeonFox vs. StarBlaze with animated score bars and AR effects.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-background/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Quick top ups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <VibeCoinPackages platform="web" />
              </CardContent>
            </Card>
          </section>
        </section>

        <footer className="mt-16 px-4 text-center text-sm text-muted-foreground">
          <Link to="/dmca">DMCA Notice</Link>
        </footer>
      </main>
    </div>
  );
};

export default Index;
