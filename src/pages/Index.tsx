import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import HeroLogoReveal from '../../components/brand/HeroLogoReveal';
import { SearchFilters, SearchFiltersState } from '@/components/SearchFilters';
import { CreatorCard } from '@/components/CreatorCard';
import { VibeCoinPackages } from '@/components/VibeCoinPackages';
import { useCreatorLive } from '@/hooks/useCreatorLive';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { groups } from '@/data/groups';
import { MessageCircle, Radio, Sparkles, Users, Workflow, Video } from 'lucide-react';
import FeelynxLogo from '@/components/brand/FeelynxLogo';
import { BRAND } from '@/config';

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
    <div className="relative min-h-screen bg-transparent md:flex">
      <Navigation activeTab="home" onTabChange={() => undefined} />
      <main
        id="main-content"
        className="relative flex-1 overflow-x-hidden pb-[calc(9rem+var(--safe-area-bottom))]"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-40" />
        <HeroLogoReveal />

        <section className="relative mx-auto mt-10 flex w-full max-w-6xl flex-col gap-12 px-4">
          <motion.section
            aria-labelledby="hero-intro"
            className="glass-panel overflow-hidden"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl" aria-hidden />
            <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-end md:justify-between md:p-12">
              <div className="max-w-2xl space-y-5">
                <span className="glass-chip !px-3 !py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">
                  Feelynx Live
                </span>
                <h1
                  id="hero-intro"
                  className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl"
                >
                  An immersive, app-style home for your live vibes
                </h1>
                <p className="max-w-xl text-base text-white/70">
                  Glide through live creators, Family crews, and Lovense-powered shows in a new
                  glassmorphism shell that feels like a premium streaming app.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-glow"
                    onClick={() => navigate('/call-room')}
                  >
                    Go live studio
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 hover:text-white"
                    onClick={() => navigate('/discover')}
                  >
                    Discover creators
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-white/70 md:text-sm">
                <div className="glass-elevated rounded-3xl p-4">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">Live now</p>
                  <p className="mt-2 text-2xl font-bold text-white">{liveCreators.length}</p>
                  <p className="text-xs text-white/60">Creators streaming with Lovense</p>
                </div>
                <div className="glass-elevated rounded-3xl p-4">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">Featured</p>
                  <p className="mt-2 text-2xl font-bold text-white">{featuredCreators.length}</p>
                  <p className="text-xs text-white/60">Stories & vault drops curated today</p>
                </div>
                <div className="glass-elevated col-span-2 rounded-3xl p-4">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">
                    Connected toys
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">💗 Synced</p>
                  <p className="text-xs text-white/60">
                    Get real-time pulses when fans tip your Lovense devices.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            aria-labelledby="creator-search"
            className="glass-panel"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="border-none bg-transparent shadow-none">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-2xl font-semibold text-white">
                    Tailor your feed
                  </CardTitle>
                  <CardDescription className="text-sm text-white/70">
                    Smart filters remember your vibe and surface interactive sessions with the
                    perfect pacing.
                  </CardDescription>
                </div>
                <Button
                  variant="secondary"
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 hover:text-white"
                  onClick={() => navigate('/creators')}
                >
                  Open directory
                </Button>
              </CardHeader>
              <CardContent className="rounded-3xl bg-black/20 p-6 backdrop-blur-xl">
                <SearchFilters {...filters} onChange={handleFiltersChange} />
              </CardContent>
            </Card>
          </motion.section>

          <motion.section
            aria-labelledby="quick-actions"
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between">
              <h2 id="quick-actions" className="text-2xl font-semibold text-white">
                Experience shortcuts
              </h2>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => navigate('/dashboard')}
              >
                View all modules
              </Button>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {quickLinks.map(
                ({ id, title, badge, description, icon: Icon, action, actionLabel }) => (
                  <Card
                    key={id}
                    className="glass-panel h-full border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-white/80">
                        <Icon className="h-5 w-5" aria-hidden />
                        <span className="text-[10px] uppercase tracking-[0.35em]">{badge}</span>
                      </div>
                      <CardTitle className="text-xl font-semibold text-white">{title}</CardTitle>
                      <CardDescription className="text-sm text-white/70">
                        {description}
                      </CardDescription>
                    </div>
                    <Button
                      className="mt-6 rounded-full bg-gradient-primary text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
                      size="sm"
                      onClick={action}
                    >
                      {actionLabel}
                    </Button>
                  </Card>
                ),
              )}
            </div>
          </motion.section>

          <motion.section
            aria-labelledby="creator-tools"
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between">
              <h2 id="creator-tools" className="text-2xl font-semibold text-white">
                Creator launchpad
              </h2>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => navigate('/live-creator')}
              >
                Open studio
              </Button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {liveTools.map(({ id, title, description, icon: Icon, action, actionLabel }) => (
                <Card key={id} className="glass-panel border-white/10 bg-white/5 p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/80">
                      <Icon className="h-5 w-5" aria-hidden />
                      <span className="text-[10px] uppercase tracking-[0.35em]">Creator tools</span>
                    </div>
                    <CardTitle className="text-xl font-semibold text-white">{title}</CardTitle>
                    <CardDescription className="text-sm text-white/70">
                      {description}
                    </CardDescription>
                  </div>
                  <Button
                    className="mt-6 rounded-full border border-white/20 bg-white/10 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 hover:text-white"
                    size="sm"
                    onClick={action}
                  >
                    {actionLabel}
                  </Button>
                </Card>
              ))}
            </div>
          </motion.section>

          <motion.section
            aria-labelledby="live-now"
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between">
              <h2 id="live-now" className="text-3xl font-bold text-white">
                🔴 Live right now
              </h2>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => navigate('/creators')}
              >
                View all live
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {liveCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} onViewProfile={handleViewProfile} />
              ))}
            </div>
          </motion.section>

          <motion.section
            aria-labelledby="featured-creators"
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between">
              <h2 id="featured-creators" className="text-3xl font-bold text-white">
                Featured crews & creators
              </h2>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => navigate('/groups')}
              >
                Explore Family crews
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {featuredCreators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} onViewProfile={handleViewProfile} />
              ))}
            </div>
          </motion.section>

          <motion.section
            aria-labelledby="crew-spotlight"
            className="flex flex-col gap-6"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between">
              <h2 id="crew-spotlight" className="text-3xl font-bold text-white">
                Family crew spotlights
              </h2>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => navigate('/groups')}
              >
                Join a Family crew
              </Button>
            </div>
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
          </motion.section>

          <motion.section
            aria-labelledby="rewards"
            className="grid gap-6 lg:grid-cols-[1.2fr_1fr]"
            initial={{ opacity: 0, y: 52 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
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
          </motion.section>
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
