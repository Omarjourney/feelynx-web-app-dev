import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Compass, Gauge, Home, Languages, Menu, Radio, Sparkles, UserRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import feelynxLogo from '@/assets/feelynx-logo.png';
import PreviewBanner from '@/components/PreviewBanner';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactiveMascot from '@/components/ReactiveMascot';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'discover', label: 'Discover', to: '/discover', icon: Compass },
  { id: 'go-live', label: 'Go Live', to: '/call-room', icon: Radio },
  { id: 'profile', label: 'Profile', to: '/dashboard', icon: UserRound },
] as const;

const NAV_ALIAS: Record<string, (typeof NAV_ITEMS)[number]['id']> = {
  home: 'home',
  discover: 'discover',
  creators: 'discover',
  explore: 'discover',
  content: 'discover',
  calls: 'discover',
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
  const [language, setLanguage] = useState('EN');
  const [experienceTheme, setExperienceTheme] = useState<'vibe' | 'midnight' | 'electric'>('vibe');
  const [brightness, setBrightness] = useState(1);
  const [fontScale, setFontScale] = useState(1);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = NAV_ITEMS;

  const activeId = useMemo(() => {
    if (activeTab) return NAV_ALIAS[activeTab] ?? activeTab;
    if (pathname.startsWith('/discover') || pathname === '/' || pathname.startsWith('/explore'))
      return 'discover';
    if (pathname.startsWith('/creators') || pathname.startsWith('/live')) return 'discover';
    if (pathname.startsWith('/calls') || pathname.startsWith('/call-room')) return 'go-live';
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/dm')
    )
      return 'profile';
    return 'home';
  }, [activeTab, pathname]);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('feelynx.language');
    const storedTheme = localStorage.getItem('feelynx.experienceTheme');
    const storedBrightness = localStorage.getItem('feelynx.brightness');
    const storedFontScale = localStorage.getItem('feelynx.fontScale');
    if (storedLanguage) setLanguage(storedLanguage);
    if (storedTheme === 'midnight' || storedTheme === 'electric') setExperienceTheme(storedTheme);
    if (storedBrightness) setBrightness(Number(storedBrightness));
    if (storedFontScale) setFontScale(Number(storedFontScale));
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-brightness', brightness.toFixed(2));
    localStorage.setItem('feelynx.brightness', brightness.toString());
  }, [brightness]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-scale', fontScale.toFixed(2));
    localStorage.setItem('feelynx.fontScale', fontScale.toString());
  }, [fontScale]);

  useEffect(() => {
    if (experienceTheme === 'vibe') {
      document.documentElement.removeAttribute('data-experience-theme');
    } else {
      document.documentElement.setAttribute('data-experience-theme', experienceTheme);
    }
    localStorage.setItem('feelynx.experienceTheme', experienceTheme);
  }, [experienceTheme]);

  useEffect(() => {
    localStorage.setItem('feelynx.language', language);
  }, [language]);

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
          <div className="relative h-12 w-12 rounded-2xl bg-gradient-primary p-2 shadow-glow">
            <img src={feelynxLogo} alt="Feelynx" className="h-full w-full object-contain" />
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

          <div className="rounded-3xl border border-border/40 bg-gradient-card p-4 shadow-premium">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Balance</span>
              <Gauge className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary-foreground">
                💎 {coins.toLocaleString()}
              </span>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary-foreground">
                ${(coins / 100).toFixed(2)} USD
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground/80">100 coins = $1.00</p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="flex-1 button-ripple"
                onClick={() => navigate('/token-shop')}
              >
                Recharge
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 hover-glow"
                onClick={() => navigate('/dashboard')}
              >
                Leaderboard
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-border/40 bg-sidebar-accent/60 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
              <span>Comfort Controls</span>
              <Languages className="h-4 w-4" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="w-full justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    {language}
                    <span className="text-xs text-muted-foreground">Localized</span>
                  </span>
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44">
                <DropdownMenuLabel>Select language</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={language}
                  onValueChange={(value) => setLanguage(value)}
                >
                  {['EN', 'ES', 'PT', 'FR'].map((lng) => (
                    <DropdownMenuRadioItem key={lng} value={lng}>
                      {lng === 'EN' && 'English'}
                      {lng === 'ES' && 'Español'}
                      {lng === 'PT' && 'Português'}
                      {lng === 'FR' && 'Français'}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Brightness</span>
                <span>{Math.round(brightness * 100)}%</span>
              </div>
              <Slider
                value={[brightness]}
                min={0.6}
                max={1.2}
                step={0.05}
                onValueChange={([value]) => setBrightness(Number(value.toFixed(2)))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Font size</span>
                <span>{Math.round(fontScale * 100)}%</span>
              </div>
              <Slider
                value={[fontScale]}
                min={0.9}
                max={1.3}
                step={0.05}
                onValueChange={([value]) => setFontScale(Number(value.toFixed(2)))}
              />
            </div>

            <div className="flex gap-2">
              {[
                { id: 'vibe', label: 'Vibe' },
                { id: 'midnight', label: 'Midnight' },
                { id: 'electric', label: 'Electric' },
              ].map((theme) => (
                <Button
                  key={theme.id}
                  variant={experienceTheme === theme.id ? 'default' : 'secondary'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setExperienceTheme(theme.id as typeof experienceTheme)}
                >
                  {theme.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-primary/30 bg-primary/10 p-4">
            <ReactiveMascot
              mood="joined"
              message="Feely Fox says: Tap Go Live to start your show!"
              className="w-full justify-start"
            />
            <div className="rounded-2xl bg-background/60 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Onboarding tips</p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed">
                <li className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Swipe horizontally on mobile to
                  swap streams instantly.
                </li>
                <li className="flex items-center gap-2">
                  <Radio className="h-3.5 w-3.5 text-primary" /> Tap “Go Live” to open the guided
                  setup.
                </li>
                <li className="flex items-center gap-2">
                  <Compass className="h-3.5 w-3.5 text-primary" /> Discover curated crews and tribes
                  under Discover.
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile fallback navigation drawer */}
      <nav className="md:hidden bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 pt-safe px-safe">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img src={feelynxLogo} alt="Feelynx" className="w-8 h-8" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                eelynx
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Badge
                variant="secondary"
                className="bg-gradient-primary text-primary-foreground px-3 py-1"
              >
                💎 {coins.toLocaleString()}
              </Badge>
              <button
                className="flex items-center justify-center min-h-11 min-w-11"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
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
