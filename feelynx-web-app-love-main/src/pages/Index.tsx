import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomeLayout } from '@/components/HomeLayout';
import { useCreatorLive } from '@/hooks/useCreatorLive';
import { useAuth } from '@/contexts/AuthContext';
import { groups } from '@/data/groups';
import { BRAND } from '@/config';
import FeelynxLogo from '@/components/brand/FeelynxLogo';
import { Button } from '@/components/ui/button';

const vibeOptions = [
  { amount: '500', price: '$5', description: 'For micro goals and welcome tips.' },
  { amount: '1000', price: '$9', description: 'Best for solo shows with custom menus.' },
  { amount: '2500', price: '$20', description: 'Crew battles and weekend marathons.' },
];

const Index = () => {
  const creators = useCreatorLive();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNewUser = !user;

  const featuredCreators = useMemo(
    () =>
      creators.slice(0, 6).map((creator) => ({
        name: creator.name,
        live: creator.isLive,
        thumbnail: creator.avatar ?? 'https://placehold.co/600x400/0b0720/ffffff?text=Feelynx',
        earnings: creator.earnings,
        onSelect: () =>
          creator.isLive ? navigate(`/live/${creator.username}`) : navigate('/creators'),
      })),
    [creators, navigate],
  );

  const communityCrews = useMemo(
    () =>
      groups.slice(0, 4).map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount: group.members,
        category: group.category,
      })),
    [],
  );

  const onboardingTips = [
    {
      title: 'Launch with confidence',
      description: 'Follow the guided setup to test lighting, Lovense pairing, and safety checklists.',
      actionLabel: 'Open creator studio',
      onClick: () => navigate('/call-room'),
    },
    {
      title: 'Activate your fan crew',
      description: 'Invite your top supporters into a private chat with goal boosts and scheduled drops.',
      actionLabel: 'Create a crew',
      onClick: () => navigate('/groups'),
    },
    {
      title: 'Offer a VibeCoin menu',
      description: 'Turn favorite actions into repeatable rewards with transparent conversion for fans.',
      actionLabel: 'Design menu',
      onClick: () => navigate('/token-shop'),
    },
  ];

  const heroSlot = (
    <motion.section
      className="glass-card relative overflow-hidden rounded-3xl px-6 py-10 md:px-10"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      aria-labelledby="home-hero"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/40 via-secondary/30 to-transparent" aria-hidden />
      <div className="relative grid gap-8 md:grid-cols-[1.1fr,0.9fr] md:items-end">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-foreground/70">
            {BRAND.tagline}
          </span>
          <h1 id="home-hero">Welcome to the Feelynx studio home</h1>
          <p className="max-w-xl text-base leading-relaxed text-foreground/70">
            Navigate creators, community crews, and monetization in one calm overview. Designed with generous spacing,
            glassmorphism, and mobile-ready controls.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="rounded-full"
              onClick={() => navigate('/discover')}
              aria-label="Discover creators"
            >
              Discover creators
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              onClick={() => navigate('/groups')}
              aria-label="Explore crews"
            >
              Explore crews
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <FeelynxLogo size={96} glow={false} />
          <p className="text-sm text-foreground/70">
            Trusted by thousands of interactive performers building safe, thriving fan ecosystems.
          </p>
        </div>
      </div>
    </motion.section>
  );

  return (
    <HomeLayout
      creators={featuredCreators}
      crews={communityCrews}
      vibeCoinOptions={vibeOptions}
      balance={{ coins: 2547, usdValue: 25.47, onRecharge: () => navigate('/token-shop'), onWithdraw: () => navigate('/payouts') }}
      onboardingTips={onboardingTips}
      isNewUser={isNewUser}
      onSelectCreator={(creator) => creator.onSelect?.()}
      onGoLive={() => navigate('/call-room')}
      heroSlot={heroSlot}
    />
  );
};

export default Index;
