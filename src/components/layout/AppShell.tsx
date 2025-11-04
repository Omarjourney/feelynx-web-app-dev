import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Gauge,
  Home,
  Menu,
  PhoneCall,
  Radio,
  Sparkles,
  UserRound,
  LogOut,
  MessageCircle,
} from 'lucide-react';

import PreviewBanner from '@/components/PreviewBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import feelynxWordmark from '@/assets/feelynx-wordmark.svg';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWallet, selectWalletBalance, selectWalletLoading } from '@/stores/useWallet';
import { useAuth } from '@/contexts/AuthContext';
import GoLiveEntry from '@/components/GoLiveEntry';
import IncomingCall from '@/components/IncomingCall';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'discover', label: 'Discover', to: '/discover', icon: Compass },
  { id: 'connect', label: 'Connect', to: '/connect', icon: PhoneCall },
  { id: 'go-live', label: 'Go Live', to: '/live-creator', icon: Radio },
  { id: 'profile', label: 'Profile', to: '/dashboard', icon: UserRound },
] as const;

const NAV_ALIAS: Record<string, (typeof NAV_ITEMS)[number]['id']> = {
  home: 'home',
  discover: 'discover',
  creators: 'discover',
  explore: 'discover',
  content: 'discover',
  connect: 'connect',
  calls: 'connect',
  groups: 'discover',
  live: 'discover',
  'live-creator': 'go-live',
  dm: 'profile',
  dashboard: 'profile',
  profile: 'profile',
  settings: 'profile',
};

type NavItem = (typeof NAV_ITEMS)[number];

const formatPathToTab = (pathname: string) => {
  const [, firstSegment] = pathname.split('/');
  if (!firstSegment) return 'home';
  return NAV_ALIAS[firstSegment] ?? 'discover';
};

export function AppShell() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const balance = useWallet(selectWalletBalance);
  const isLoadingWallet = useWallet(selectWalletLoading);
  const fetchWallet = useWallet((state) => state.fetch);
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const activeItem = useMemo(() => {
    const tabId = formatPathToTab(location.pathname);
    return NAV_ITEMS.find((item) => item.id === tabId) ?? NAV_ITEMS[0];
  }, [location.pathname]);

  const handleNavigate = (item: NavItem) => {
    if (item.id === 'profile' && !user) {
      navigate('/auth');
      return;
    }
    navigate(item.to);
  };

  const handleSignOut = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    await signOut();
  };

  const coinsDisplay = isLoadingWallet ? '…' : balance.toLocaleString();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only absolute left-4 top-4 z-[999] rounded bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen">
        {!isMobile && (
          <aside className="hidden w-72 flex-shrink-0 border-r border-border/60 bg-sidebar-background/80 px-6 pt-safe md:flex md:flex-col md:backdrop-blur-xl">
            <div className="flex items-center gap-3 pt-8 pb-6">
              <div className="relative rounded-2xl bg-gradient-primary p-2 shadow-glow">
                <img src={feelynxWordmark} alt="Feelynx" className="h-10 w-auto" width={40} height={40} loading="eager" decoding="sync" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-widest text-muted-foreground">Entertainment</p>
                <p className="text-2xl font-extrabold text-foreground">Feelynx</p>
              </div>
            </div>

            <nav className="flex-1 space-y-6">
              <div className="space-y-2">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item)}
                      className={cn(
                        'button-ripple hover-glow group flex w-full items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-left text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
                        isActive
                          ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                          : 'bg-sidebar-accent/50 text-sidebar-foreground hover:bg-sidebar-accent/90',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </span>
                      {item.id === 'go-live' && (
                        <span className="flex items-center gap-1 text-xs uppercase tracking-wide text-primary-foreground/80">
                          <Sparkles className="h-3 w-3" /> Live
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-3xl border border-border/40 bg-gradient-card p-4 shadow-premium">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Balance</span>
                  <Gauge className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary-foreground">💎 {coinsDisplay}</span>
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary-foreground">100 coins = $1</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground/80">Top up from your dashboard</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" className="flex-1 button-ripple" onClick={() => navigate('/dashboard#wallet')}>
                    Manage Wallet
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 hover-glow"
                    onClick={() => navigate('/dashboard#leaderboard')}
                  >
                    Leaderboard
                  </Button>
                </div>
              </div>
            </nav>

            <div className="mb-6 flex items-center justify-between rounded-full bg-sidebar-accent/60 px-4 py-2 text-sm text-sidebar-foreground">
              <span className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Open DMs
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full"
                onClick={() => navigate('/dm')}
                aria-label="Open direct messages"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="mb-8 flex items-center justify-center gap-2 text-sm"
            >
              <LogOut className="h-4 w-4" />
              {user ? 'Sign out' : 'Sign in'}
            </Button>
          </aside>
        )}

        <div className="flex min-h-screen flex-1 flex-col">
          <div className="sticky top-0 z-40">
            <PreviewBanner />
            {isMobile && (
              <nav className="bg-background/95 backdrop-blur-sm border-b border-border pt-safe">
                <div className="px-safe">
                  <div className="flex h-16 items-center justify-between px-4">
                    <div className="flex items-center space-x-2">
                      <img src={feelynxWordmark} alt="Feelynx" className="h-8 w-auto" width={32} height={32} loading="eager" decoding="sync" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="secondary"
                        className="bg-gradient-primary text-primary-foreground px-3 py-1"
                        aria-live="polite"
                      >
                        💎 {coinsDisplay}
                      </Badge>
                      <button
                        className="flex min-h-11 min-w-11 items-center justify-center"
                        onClick={() => setIsMobileMenuOpen((open) => !open)}
                        aria-expanded={isMobileMenuOpen}
                        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                        type="button"
                      >
                        <Menu className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  {isMobileMenuOpen && (
                    <div className="flex flex-col space-y-2 px-4 pb-4">
                      {NAV_ITEMS.map((item) => (
                        <Button
                          key={item.id}
                          variant={activeItem.id === item.id ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => handleNavigate(item)}
                          className={cn(
                            'min-h-11 min-w-11 justify-start rounded-full',
                            activeItem.id === item.id
                              ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                          )}
                        >
                          {item.label}
                        </Button>
                      ))}
                      <Button variant="ghost" size="sm" onClick={() => navigate('/dm')} className="justify-start">
                        Direct Messages
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="justify-start"
                      >
                        {user ? 'Sign out' : 'Sign in'}
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            )}
          </div>

          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            <Outlet />
          </main>

          {isMobile ? (
            <motion.nav
              layout
              className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-safe"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                layout
                className="glass-elevated relative flex w-full max-w-xl items-center justify-between gap-2 rounded-[var(--radius-card)] px-3 py-2.5 sm:px-4 sm:py-3"
              >
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === activeItem.id;
                  const isGoLive = item.id === 'go-live';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item)}
                      className={cn(
                        'relative flex flex-1 flex-col items-center gap-1 text-[10px] font-medium text-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-xs',
                        isActive && 'text-white',
                      )}
                    >
                      <div
                        className={cn(
                          'relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-lg transition-colors duration-300',
                          isActive && 'bg-gradient-primary text-white shadow-glow border-white/20',
                          isGoLive && 'h-12 w-12 shadow-glow sm:h-13 sm:w-13',
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={cn('text-[10px] sm:text-xs', isActive && 'font-semibold')}>{item.label}</span>
                    </button>
                  );
                })}
              </motion.div>
              <motion.div
                className="pointer-events-none absolute inset-x-4 -bottom-2 h-8 rounded-full bg-gradient-primary opacity-40 blur-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              />
            </motion.nav>
          ) : null}

          <GoLiveEntry />
          <IncomingCall />
        </div>
      </div>
    </div>
  );
}

export default AppShell;
