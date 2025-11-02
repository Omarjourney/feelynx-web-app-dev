import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Compass, Home, Menu, UserRound, PhoneCall, Radio, Sparkles } from 'lucide-react';
import feelynxWordmark from '@/assets/feelynx-wordmark.svg';
import { useLocation, useNavigate } from 'react-router-dom';
import PreviewBanner from '@/components/PreviewBanner';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'discover', label: 'Discover', to: '/discover', icon: Compass },
  { id: 'connect', label: 'Connect', to: '/connect', icon: PhoneCall },
  { id: 'go-live', label: 'Go Live', to: '/call-room', icon: Radio },
  { id: 'profile', label: 'Profile', to: '/dashboard', icon: UserRound },
] as const;

const NAV_ALIAS: Record<string, (typeof NAV_ITEMS)[number]['id']> = {
  home: 'home',
  discover: 'discover',
  creators: 'discover',
  explore: 'discover',
  content: 'discover',
  calls: 'connect',
  connect: 'connect',
  groups: 'discover',
  live: 'discover',
  'live-creator': 'go-live',
  'call-room': 'go-live',
  go: 'go-live',
  dm: 'profile',
  dashboard: 'profile',
  profile: 'profile',
  settings: 'profile',
};

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [coins] = useState(2547);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = NAV_ITEMS;

  const activeId = useMemo(() => {
    if (activeTab) return NAV_ALIAS[activeTab] ?? activeTab;
    if (pathname.startsWith('/discover') || pathname === '/' || pathname.startsWith('/explore'))
      return 'discover';
    if (pathname.startsWith('/creators') || pathname.startsWith('/live')) return 'discover';
    if (pathname.startsWith('/connect')) return 'connect';
    if (pathname.startsWith('/calls') || pathname.startsWith('/call-room')) return 'go-live';
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/dm')
    )
      return 'profile';
    return 'home';
  }, [activeTab, pathname]);

  const handleNav = (id: (typeof navItems)[number]['id'], to: string) => {
    onTabChange?.(id);
    navigate(to);
  };

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-0 left-0 m-4">
        Skip to content
      </a>
      <aside className="hidden md:flex md:h-screen md:w-72 md:flex-shrink-0 md:flex-col md:border-r md:border-border/60 md:bg-sidebar-background/80 md:backdrop-blur-xl md:pt-safe">
        <div className="flex items-center gap-3 px-6 pt-8 pb-6">
          <div className="relative rounded-2xl bg-gradient-primary p-2 shadow-glow">
            <img src={feelynxWordmark} alt="Feelynx" className="h-10 w-auto" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Entertainment</p>
            <p className="text-2xl font-extrabold text-foreground">Feelynx</p>
          </div>
        </div>

        <nav className="flex-1 space-y-6 px-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id, item.to)}
                  className={cn(
                    'button-ripple hover-glow group flex w-full items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-left text-base font-semibold transition-colors',
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

          <div className="rounded-3xl border border-border/40 bg-sidebar-accent/60 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Need to tweak the vibe?</p>
            <p className="mt-2 leading-relaxed">
              Use the ⚙️ icon in the header to adjust language, brightness, and typography whenever you need.
            </p>
          </div>
        </nav>
      </aside>

      {/* Mobile fallback navigation drawer */}
      <nav className="md:hidden bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 pt-safe px-safe">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img src={feelynxWordmark} alt="Feelynx" className="h-8 w-auto" />
            </div>

            <div className="flex items-center space-x-3">
              <Badge
                variant="secondary"
                className="bg-gradient-primary text-primary-foreground px-3 py-1"
              >
                💎 {coins.toLocaleString()}
              </Badge>
              <button
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="flex flex-col space-y-2 pb-4">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeId === item.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    handleNav(item.id, item.to);
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    'min-h-11 min-w-11 justify-start rounded-full',
                    activeId === item.id
                      ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                  )}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </nav>
      {/* Preview banner shows environment/feature availability for hosted previews */}
      <PreviewBanner />
    </>
  );
};
