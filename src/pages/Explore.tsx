import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { UNSPLASH_RANDOM_BASE_URL } from '@/config';
import { SearchFilters, SearchFiltersState } from '@/components/SearchFilters';
import LiveStreamCard from '@/components/LiveStreamCard';
import StoryBubbles from '@/components/StoryBubbles';
import LiveStreamModal from '@/components/LiveStreamModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchCreators } from '@/data/creators';
import type { Creator } from '@/types/creator';
import { toast } from '@/hooks/use-toast';
import { getUserMessage } from '@/lib/errors';

const Explore = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<SearchFiltersState>({
    search: '',
    country: 'all',
    specialty: 'all',
    isLive: false,
    sort: 'trending',
  });
  const [tab, setTab] = useState('all');
  const [modalCreator, setModalCreator] = useState<Creator | null>(null);
  const [open, setOpen] = useState(false);
  const [localized, setLocalized] = useState(true);
  const [midnightMode, setMidnightMode] = useState(false);

  const {
    data: creators = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['creators', filters],
    queryFn: ({ signal }) => fetchCreators(filters, signal),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!error) return;
    toast({
      title: 'Unable to load creators',
      description: getUserMessage(error),
      variant: 'destructive',
    });
  }, [error]);

  const parseCount = (value?: string) => {
    if (!value) return 0;
    const normalized = value.trim().toLowerCase();
    const numeric = Number.parseFloat(normalized.replace(/[^0-9.]/g, ''));
    if (Number.isNaN(numeric)) return 0;
    if (normalized.endsWith('m')) return numeric * 1_000_000;
    if (normalized.endsWith('k')) return numeric * 1_000;
    return numeric;
  };

  const compactNumberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }),
    [],
  );

  const stats = useMemo(() => {
    if (!creators.length) {
      return {
        totalCreators: 0,
        liveCount: 0,
        totalViewers: 0,
        liveViewers: 0,
        averageViewers: 0,
        followerTotal: 0,
        energyLevel: 0,
        midnightMomentum: 0,
      };
    }
    const liveCreators = creators.filter((c) => c.isLive);
    const totalViewers = creators.reduce((sum, c) => sum + (c.viewers ?? 0), 0);
    const liveViewers = liveCreators.reduce((sum, c) => sum + (c.viewers ?? 0), 0);
    const averageViewers = liveCreators.length ? Math.round(liveViewers / liveCreators.length) : 0;
    const followerTotal = creators.reduce((sum, c) => sum + parseCount(c.subscribers), 0);

    return {
      totalCreators: creators.length,
      liveCount: liveCreators.length,
      totalViewers,
      liveViewers,
      averageViewers,
      followerTotal,
      energyLevel: Math.min(100, Math.round(liveViewers / 120)),
      midnightMomentum: Math.min(
        100,
        Math.round((liveCreators.length / Math.max(creators.length, 1)) * 100),
      ),
    };
  }, [creators]);

  const filteredCreators = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();
    const normalizedCountry = filters.country.toLowerCase();
    const normalizedSpecialty = filters.specialty.toLowerCase();

    return creators
      .filter((c) => {
        if (normalizedSearch && !`${c.name} ${c.username}`.toLowerCase().includes(normalizedSearch))
          return false;
        if (filters.isLive && !c.isLive) return false;
        if (
          filters.country !== 'all' &&
          !(c.country && c.country.toLowerCase().includes(normalizedCountry))
        )
          return false;
        if (
          filters.specialty !== 'all' &&
          !c.specialties.some((specialty) => specialty.toLowerCase().includes(normalizedSpecialty))
        )
          return false;
        if (tab === 'trending' && !c.isFeatured) return false;
        if (
          tab === 'nearby' &&
          !(c.country && ['usa', 'canada', 'mexico'].includes(c.country.toLowerCase()))
        )
          return false;
        if (tab === 'newest' && c.isFeatured) return false;
        if (tab === 'personalized' && !(c.isFeatured || c.isLive)) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.sort === 'newest') return b.id - a.id;
        if (filters.sort === 'followers')
          return parseCount(b.subscribers) - parseCount(a.subscribers);
        return (b.viewers || 0) - (a.viewers || 0);
      });
  }, [creators, filters, tab]);

  const handleFiltersChange = (newFilters: Partial<SearchFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleWatch = (username: string) => {
    const creator = creators.find((c) => c.username === username);
    if (creator) {
      setModalCreator(creator);
      setOpen(true);
    }
  };

  const storyCreators = creators
    .filter((c) => c.isLive)
    .map((c) => ({
      username: c.username,
      avatar: c.avatar || `${UNSPLASH_RANDOM_BASE_URL}200x200?sig=${c.id}`,
      isLive: c.isLive,
      badge: c.tier,
    }));

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-12">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
          <StoryBubbles creators={storyCreators} onSelect={handleWatch} />
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="border border-border/60 bg-background/80 backdrop-blur">
              <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-2xl font-semibold text-foreground">
                    Crew mission control
                  </CardTitle>
                  <CardDescription>
                    Track live traction, prep boosts, and keep your discover funnel humming.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" className="button-ripple" disabled={isLoading}>
                    Recharge
                  </Button>
                  <Button variant="outline" disabled={isLoading}>
                    Leaderboard
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-premium">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Creators live
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {isLoading ? '…' : stats.liveCount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isLoading
                        ? 'Loading roster…'
                        : `${stats.totalCreators.toLocaleString()} total roster`}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-premium">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Viewers engaged
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {isLoading ? '…' : stats.totalViewers.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isLoading
                        ? 'Syncing live rooms…'
                        : `${stats.liveViewers.toLocaleString()} watching live`}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4 shadow-premium">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      Crew followers
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {isLoading ? '…' : compactNumberFormatter.format(stats.followerTotal)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isLoading
                        ? 'Calculating averages…'
                        : `Avg ${stats.averageViewers.toLocaleString()} per stage`}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                      <span>Entrance energy</span>
                      <span className="text-foreground">
                        {isLoading ? '—' : `${stats.energyLevel}%`}
                      </span>
                    </div>
                    <Progress value={isLoading ? 0 : stats.energyLevel} className="mt-3 h-2 bg-muted/40" />
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Localized routing</span>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={localized}
                          onCheckedChange={setLocalized}
                          aria-label="Toggle localized routing"
                        />
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          EN localized
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Midnight mode</span>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={midnightMode}
                          onCheckedChange={setMidnightMode}
                          aria-label="Toggle midnight mode"
                        />
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {isLoading ? '—' : `${stats.midnightMomentum}% ready`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">Combat controls</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" className="px-3 py-1 text-xs">
                        Stage scripts
                      </Button>
                      <Button size="sm" variant="outline" className="px-3 py-1 text-xs">
                        Vibe polls
                      </Button>
                      <Button size="sm" variant="outline" className="px-3 py-1 text-xs">
                        PK prep
                      </Button>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">
                      Prime overlays, playlists, and auto-toy triggers before going live.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Button variant="outline" className="justify-between px-4 py-3 text-sm">
                    Alerts
                    <Badge className="bg-live text-white">Live</Badge>
                  </Button>
                  <Button variant="outline" className="justify-between px-4 py-3 text-sm">
                    Crew goals
                    <span className="text-xs text-muted-foreground">
                      {isLoading ? '—' : `${stats.midnightMomentum}%`}
                    </span>
                  </Button>
                  <Button variant="secondary" className="button-ripple justify-between px-4 py-3 text-sm">
                    Invite fans
                    <span className="text-xs text-primary-foreground/80">Boost reach</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border/60 bg-background/80 backdrop-blur">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <span role="img" aria-hidden="true">
                    🦊
                  </span>
                  Feelynx says
                </div>
                <CardTitle className="text-xl text-foreground">
                  Tip your crew to keep the energy meter soaring!
                </CardTitle>
                <CardDescription>
                  Share a highlight clip and drop a crew chest to unlock tonight&apos;s bonus wheel.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4 text-primary-foreground">
                  <p className="text-xs uppercase tracking-widest">Next milestone</p>
                  <p className="mt-1 text-sm font-semibold text-primary-foreground">
                    {isLoading ? 'Syncing…' : `${Math.min(100, stats.energyLevel + 12)}% hype unlock in 3 crew tips`}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                    <span>Energy meter</span>
                    <span>{isLoading ? '—' : `${stats.energyLevel}%`}</span>
                  </div>
                  <Progress value={isLoading ? 0 : stats.energyLevel} className="mt-2 h-2 bg-muted/40" />
                </div>
                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
                  <span>Squad streak</span>
                  <span>{isLoading ? '—' : `${stats.liveCount} nights`}</span>
                </div>
                <Button className="button-ripple w-full" variant="secondary">
                  Launch onboarding tips
                </Button>
              </CardContent>
            </Card>
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4 w-full justify-start gap-2 rounded-full bg-background/80 p-1">
              <TabsTrigger value="all" className="rounded-full px-4 py-2 text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="trending" className="rounded-full px-4 py-2 text-sm">
                Trending
              </TabsTrigger>
              <TabsTrigger value="nearby" className="rounded-full px-4 py-2 text-sm">
                Nearby
              </TabsTrigger>
              <TabsTrigger value="newest" className="rounded-full px-4 py-2 text-sm">
                New
              </TabsTrigger>
              <TabsTrigger value="personalized" className="rounded-full px-4 py-2 text-sm">
                For You
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <SearchFilters {...filters} onChange={handleFiltersChange} />
          {error && !creators.length ? (
            <Card className="border border-destructive/40 bg-destructive/10">
              <CardContent className="py-6 text-sm text-destructive">
                {getUserMessage(error)}
              </CardContent>
            </Card>
          ) : null}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredCreators.map((c) => (
              <LiveStreamCard
                key={c.id}
                username={c.username}
                avatar={c.avatar ?? ''}
                viewerCount={c.viewers || 0}
                isFeatured={c.isFeatured}
                streamPreviewUrl={`${UNSPLASH_RANDOM_BASE_URL}400x300?sig=${c.id}`}
                badge={c.isFeatured ? 'VIP' : undefined}
                onWatch={() => handleWatch(c.username)}
              />
            ))}
            {!filteredCreators.length && !isLoading ? (
              <Card className="col-span-full border border-border/60 bg-background/70 p-8 text-center text-sm text-muted-foreground">
                <CardContent>
                  No creators match your filters right now. Try adjusting your search or check back
                  soon.
                </CardContent>
              </Card>
            ) : null}
          </div>
          <LiveStreamModal creator={modalCreator} open={open} onOpenChange={setOpen} />
        </div>
      </main>
    </div>
  );
};

export default Explore;
