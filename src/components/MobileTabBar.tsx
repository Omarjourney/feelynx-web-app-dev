import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Compass, Home, Radio, UserRound } from 'lucide-react';

type Tab = {
  id: string;
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled?: boolean;
};

export default function MobileTabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = useMemo<Tab[]>(
    () =>
      [
        { id: 'home', label: 'Home', to: '/', icon: Home },
        { id: 'discover', label: 'Discover', to: '/discover', icon: Compass },
        { id: 'go-live', label: 'Go Live', to: '/call-room', icon: Radio },
        { id: 'profile', label: 'Profile', to: '/dashboard', icon: UserRound },
      ].filter(Boolean) as Tab[],
    [],
  );

  const activeId = useMemo(() => {
    if (pathname === '/' || pathname === '/index') return 'home';
    if (
      pathname.startsWith('/discover') ||
      pathname.startsWith('/explore') ||
      pathname.startsWith('/creators')
    )
      return 'discover';
    if (
      pathname.startsWith('/live') ||
      pathname.startsWith('/call-room') ||
      pathname.startsWith('/live-creator')
    )
      return 'go-live';
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/dm')
    )
      return 'profile';
    return 'discover';
  }, [pathname]);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="absolute -top-8 left-1/2 w-32 -translate-x-1/2 rounded-full bg-primary/40 py-1 text-center text-xs font-semibold text-primary-foreground/90 shadow-glow">
        Swipe to swap streams
      </div>
      <ul className="grid grid-cols-4">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeId === t.id;
          return (
            <li key={t.id}>
              <button
                className={cn(
                  'relative flex h-14 w-full flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors',
                  active
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => navigate(t.to)}
                aria-current={active ? 'page' : undefined}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-all',
                    t.id === 'go-live' ? 'shadow-glow' : 'bg-transparent',
                    active
                      ? 'bg-gradient-primary text-primary-foreground'
                      : 'bg-secondary/40 text-muted-foreground',
                  )}
                >
                  <Icon className={cn('h-5 w-5', active && 'text-primary-foreground')} />
                </div>
                <span className="leading-none">{t.label}</span>
                {t.id === 'go-live' && (
                  <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary/80 px-3 py-0.5 text-[10px] uppercase tracking-widest text-primary-foreground">
                    Live
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="h-2" />
    </nav>
  );
}
