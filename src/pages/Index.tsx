import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import HeroLogoReveal from '../../components/brand/HeroLogoReveal';
import type { SearchFiltersState } from '@/components/SearchFilters';
import { VibeCoinPackages } from '@/components/VibeCoinPackages';
import { useCreatorLive } from '@/hooks/useCreatorLive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { groups } from '@/data/groups';
import { MessageCircle, Radio, Sparkles, Users, Workflow, Video } from 'lucide-react';
import FeelynxLogo from '@/components/brand/FeelynxLogo';
import { BRAND } from '@/config';
import { HeroSection } from '@/components/home/HeroSection';
import { FilterSection } from '@/components/home/FilterSection';
import { ActionTilesSection } from '@/components/home/ActionTilesSection';
import { CreatorGridSection } from '@/components/home/CreatorGridSection';
import { PageSection } from '@/components/layout/PageSection';

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

  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsThemeReady(true);
      return;
    }

    const root = document.documentElement;
    const hasThemeTokens = () => {
      const styles = getComputedStyle(root);
      const backgroundToken = styles.getPropertyValue('--background');
      const foregroundToken = styles.getPropertyValue('--foreground');
      return Boolean(backgroundToken.trim() || foregroundToken.trim());
    };

    if (hasThemeTokens()) {
      setIsThemeReady(true);
      return;
    }

    let intervalId: number | undefined; // eslint-disable-line prefer-const
    let mutationObserver: MutationObserver | undefined; // eslint-disable-line prefer-const

    const cleanup = () => {
      mutationObserver?.disconnect();
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };

    const markReadyIfTokensExist = () => {
      if (hasThemeTokens()) {
        setIsThemeReady(true);
        cleanup();
      }
    };

    mutationObserver = new MutationObserver(markReadyIfTokensExist);
    mutationObserver.observe(root, { attributes: true, attributeFilter: ['class', 'style'] });

    intervalId = window.setInterval(markReadyIfTokensExist, 160);

    markReadyIfTokensExist();

    return cleanup;
  }, []);

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

  const heroStats = [
    {
      title: 'Live sessions',
      value: liveCreators.length,
      description: 'Creators streaming with Lovense integrations right now.',
    },
    {
      title: 'Featured drops',
      value: featuredCreators.length,
      description: 'Stories, vault packs, and curated crews for today only.',
    },
    {
      title: 'Toy sync',
      value: 'Real-time pulses',
      description: 'Fans trigger Lovense responses with zero-lag haptics.',
    },
    {
      title: 'Viewer streak',
      value: '6 day streak',
      description: 'Unlock XP multipliers and loyalty perks after Day 7.',
    },
  ];

  const quickLinks = [
    {
      id: 'feelynx-control',
      title: 'Feelynx control room',
      badge: 'Interactive toys',
      description: 'Sync toys, launch interactive patterns, and run playbooks in one tap.',
      icon: Workflow,
      action: () => navigate('/call-room'),
      actionLabel: 'Open control',
    },
    {
      id: 'messages',
      title: 'Messages & threads',
      badge: 'Community',
      description: 'Keep DMs, fan mail, and unlockable replies in one focused inbox.',
      icon: MessageCircle,
      action: () => navigate('/dm'),
      actionLabel: 'Go to inbox',
    },
    {
      id: 'content',
      title: 'Premium content',
      badge: 'Vault',
      description: 'Drop clips, galleries, and vault packs with smart sorting for fans.',
      icon: Video,
      action: () => navigate('/content'),
      actionLabel: 'Browse library',
    },
    {
      id: 'groups',
      title: 'Family crews',
      badge: 'Groups',
      description: 'Join curated micro-communities with live chat boosts and shared quests.',
      icon: Users,
      action: () => navigate('/groups'),
      actionLabel: 'View crews',
    },
  ];

  const liveTools = [
    {
      id: 'go-live',
      title: 'Launch a live session',
      description: 'Guided checklist with camera, Lovense, and goal presets.',
      icon: Radio,
      action: () => navigate('/live-creator'),
      actionLabel: 'Creator studio',
    },
    {
      id: 'contests',
      title: 'Feelynx contests',
      description: 'Host bracket matches, PK battles, and story-led events.',
      icon: Sparkles,
      action: () => navigate('/contests'),
      actionLabel: 'See events',
    },
  ];

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
    <div className="relative min-h-screen bg-[#05010f] text-white md:flex">
      <Navigation activeTab="home" onTabChange={() => undefined} />
      <main
        id="main-content"
        className="relative flex-1 overflow-x-hidden pb-[calc(9rem+var(--safe-area-bottom))]"
      >
        {isThemeReady && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-40" />
        )}
        <HeroLogoReveal />

        <section className="relative mx-auto mt-10 flex w-full max-w-6xl flex-col gap-12 px-4">
          <HeroSection
            stats={heroStats}
            onPrimaryCta={() => navigate('/call-room')}
            onSecondaryCta={() => navigate('/discover')}
          />

          <FilterSection
            {...filters}
            onChange={handleFiltersChange}
            onOpenDirectory={() => navigate('/creators')}
          />

          <ActionTilesSection
            id="experience-shortcuts"
            title="Experience shortcuts"
            description="Jump into the highest-impact areas of Feelynx without digging through menus."
            actions={
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => navigate('/dashboard')}
              >
                View all modules
              </Button>
            }
            tiles={quickLinks.map(({ id, title, badge, description, icon, action, actionLabel }) => ({
              id,
              title,
              badge,
              description,
              icon,
              actionLabel,
              onAction: action,
            }))}
          />

          <ActionTilesSection
            id="creator-launchpad"
            title="Creator launchpad"
            description="Equip your broadcast with guided flows, contests, and Lovense automation."
            actions={
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => navigate('/live-creator')}
              >
                Open studio
              </Button>
            }
            gridClassName="grid gap-5 md:grid-cols-2"
            tiles={liveTools.map(({ id, title, description, icon, action, actionLabel }) => ({
              id,
              title,
              badge: 'Creator tools',
              description,
              icon,
              actionLabel,
              onAction: action,
            }))}
          />

          <CreatorGridSection
            id="live-creators"
            title="Live right now"
            creators={liveCreators}
            onSelect={handleViewProfile}
            onViewAll={() => navigate('/creators')}
            viewAllLabel="Browse all live"
            emptyState="No creators are live right now. Follow your favorites to get notified the moment they start streaming."
          />

          <CreatorGridSection
            id="featured-creators"
            title="Featured crews & creators"
            creators={featuredCreators}
            onSelect={handleViewProfile}
            onViewAll={() => navigate('/groups')}
            viewAllLabel="Explore crews"
          />

          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <PageSection
              id="crew-spotlight"
              title="Family crew spotlights"
              actions={
                <Button
                  variant="ghost"
                  className="text-white/70 hover:text-white"
                  onClick={() => navigate('/groups')}
                >
                  Join a Family crew
                </Button>
              }
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groups.slice(0, 6).map((group) => (
                  <Card key={group.id} className="glass-panel border-white/10 bg-white/5 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-white">{group.name}</p>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">
                          Crew · {group.members.toLocaleString()} members
                        </p>
                      </div>
                      <span className="hidden md:inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/60">
                        Private · Invite only
                      </span>
                      {group.isLive && (
                        <span className="glass-chip animate-pulse-ring border-white/20 bg-pink-500/15 text-xs text-pink-100">
                          Live
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-sm text-white/70 line-clamp-3">{group.description}</p>
                    <div className="mt-5 flex items-center justify-between text-xs text-white/60">
                      <span>Daily quests ready</span>
                      <span className="glass-chip !border-white/20 !bg-white/10 text-xs text-white/80">
                        +150 XP
                      </span>
                    </div>
                    <Button
                      className="mt-5 rounded-full bg-gradient-primary text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
                      onClick={() => navigate(`/groups/${group.id}`)}
                    >
                      Enter crew space
                    </Button>
                  </Card>
                ))}
              </div>
            </PageSection>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 52 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <PageSection id="rewards" title="Rewards & top ups">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <Card className="glass-panel border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-white">
                      Gamified rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="glass-elevated rounded-3xl border-white/15 bg-white/10 p-4 text-sm text-white">
                      <p className="text-lg font-bold">Level 12</p>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">Viewer XP</p>
                      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="absolute inset-y-0 left-0 w-[68%] rounded-full bg-gradient-primary" />
                      </div>
                      <p className="mt-3 text-xs text-white/70">
                        320 XP to unlock "Big Spender" badge.
                      </p>
                    </div>
                    <div className="glass-elevated rounded-3xl border-white/15 bg-white/10 p-4 text-sm text-white">
                      <p className="text-lg font-bold">Streak · 6 days</p>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                        Login bonus
                      </p>
                      <p className="mt-3 text-xs text-white/70">
                        Spin the Lucky Wheel for multipliers after Day 7.
                      </p>
                    </div>
                    <div className="glass-elevated rounded-3xl border-white/15 bg-white/10 p-4 text-sm text-white">
                      <p className="text-lg font-bold">PK Battles</p>
                      <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                        Tonight 9 PM
                      </p>
                      <p className="mt-3 text-xs text-white/70">
                        Watch NeonFox vs. StarBlaze with animated score bars and AR effects.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-panel border-white/10 bg-white/5">
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-white">Quick top ups</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <VibeCoinPackages platform="web" />
                  </CardContent>
                </Card>
              </div>
            </PageSection>
          </motion.div>
        </section>

        <footer className="mx-auto mt-16 w-full max-w-6xl px-4 text-center text-sm text-white/60">
          <div className="flex flex-col items-center gap-4 pb-4">
            {BRAND.v2Wordmark ? (
              <FeelynxLogo
                size={180}
                glow
                className="logo-glow"
                tagline="Feel the vibe. Live the show."
                theme="light"
              />
            ) : (
              <span className="text-lg font-semibold text-white">Feelynx</span>
            )}
          </div>
          <Link to="/dmca" className="hover:text-white">
            DMCA Notice
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default Index;
