import Navbar from '../components/Navbar';
import { HomeLayout } from '../components/HomeLayout';
import type { CreatorCardProps } from '../components/ui/CreatorCard';
import type { CrewCardProps } from '../components/ui/CrewCard';
import type { VibeOptionProps } from '../components/ui/VibeOption';
import type { OnboardingTip } from '../components/home/OnboardingTips';

const creators: CreatorCardProps[] = [
  {
    name: 'LunaWave',
    live: true,
    thumbnail: 'https://images.unsplash.com/photo-1529158062015-cad636e69505?auto=format&fit=crop&w=600&q=80',
    earnings: '$2.1k this week',
  },
  {
    name: 'NovaMuse',
    live: false,
    thumbnail: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=600&q=80',
    earnings: '$1.4k this week',
  },
  {
    name: 'EchoRealm',
    live: true,
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    earnings: '$980 this week',
  },
  {
    name: 'VelvetArcade',
    live: false,
    thumbnail: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=600&q=80',
    earnings: '$870 this week',
  },
  {
    name: 'MiraNova',
    live: true,
    thumbnail: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80',
    earnings: '$1.1k this week',
  },
  {
    name: 'AriaStream',
    live: false,
    thumbnail: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
    earnings: '$760 this week',
  },
];

const crews: CrewCardProps[] = [
  {
    name: 'Glow Collective',
    description: 'Daily mindfulness check-ins and consent-forward moderation for calm viewers.',
    memberCount: 842,
    category: 'Wellness',
  },
  {
    name: 'Pulse Raiders',
    description: 'Weekend PK Battles, curated playlists, and collaborative storyline events.',
    memberCount: 1165,
    category: 'Competitive',
  },
  {
    name: 'Dream Society',
    description: 'Global support group focusing on positive affirmations and peer moderation.',
    memberCount: 654,
    category: 'Community',
  },
  {
    name: 'Studio Sparks',
    description: 'Creator-only mastermind with tips on monetization funnels and scheduling.',
    memberCount: 428,
    category: 'Creator Lab',
  },
];

const vibeOptions: VibeOptionProps[] = [
  { amount: '500', price: '$5', description: 'Starter pack for quick cheers and welcomes.' },
  { amount: '1000', price: '$9', description: 'Great for duo streams and mini milestones.' },
  { amount: '2500', price: '$20', description: 'Crew goal pushes and extended playlists.' },
];

const onboardingTips: OnboardingTip[] = [
  {
    title: 'Launch with a checklist',
    description: 'Test lighting, frame your scene, and confirm Lovense pairing in the safe room.',
    actionLabel: 'Open studio setup',
  },
  {
    title: 'Schedule your first drop',
    description: 'Plan a 30-minute welcome stream and invite fans from your top socials.',
    actionLabel: 'Schedule stream',
  },
  {
    title: 'Create a fan crew',
    description: 'Reward your first 20 supporters with exclusive polls and drop alerts.',
    actionLabel: 'Build fan crew',
  },
];

const hero = (
  <section className="glass-card grid gap-8 rounded-3xl px-6 py-10 md:grid-cols-2 md:px-10" aria-labelledby="hero-heading">
    <div className="space-y-5">
      <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-foreground/70">
        Stream studio overview
      </p>
      <h1 id="hero-heading">Guide your community with clarity</h1>
      <p className="max-w-xl text-foreground/70">
        A reorganized home base that surfaces the three core actions—discover, go live, and support—without overwhelming cards or duplicate CTAs.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href="#discover"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
        >
          Browse creators
        </a>
        <a
          href="#community"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
        >
          Explore crews
        </a>
      </div>
    </div>
    <div className="glass-card flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-foreground">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-foreground/60">This week</p>
        <p className="mt-2 text-2xl font-semibold">Top community actions</p>
      </div>
      <ul className="space-y-3 text-foreground/80">
        <li>• 18 creators launched new welcome flows.</li>
        <li>• 9 crews scheduled collaborative PK Battles.</li>
        <li>• $6.7k VibeCoins converted to cashouts.</li>
      </ul>
      <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
        Updated daily
      </span>
    </div>
  </section>
);

const Index = () => {
  const handleGoLive = () => {
    console.log('Go Live action triggered');
  };

  const handleSelectCreator = (creator: CreatorCardProps) => {
    console.log('Selected creator', creator.name);
  };

  return (
    <div className="space-y-10 pb-20">
      <Navbar />
      <HomeLayout
        creators={creators}
        crews={crews}
        vibeCoinOptions={vibeOptions}
        balance={{ coins: 2547, usdValue: 25.47 }}
        onboardingTips={onboardingTips}
        isNewUser
        onSelectCreator={handleSelectCreator}
        onGoLive={handleGoLive}
        heroSlot={hero}
      />
    </div>
  );
};

export default Index;
