import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FEATURES } from '@/config';
import { cn } from '@/lib/utils';
import { Home, Radio, PhoneCall, Images, MessageSquare, User } from 'lucide-react';

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
        { id: 'discover', label: 'Discover', to: '/discover', icon: Home },
        FEATURES.live && { id: 'creators', label: 'Live', to: '/creators', icon: Radio },
        FEATURES.calls && { id: 'calls', label: 'Calls', to: '/calls', icon: PhoneCall },
        FEATURES.content && { id: 'content', label: 'Content', to: '/content', icon: Images },
        { id: 'dm', label: 'Messages', to: '/dm', icon: MessageSquare },
        { id: 'dashboard', label: 'Profile', to: '/dashboard', icon: User },
      ].filter(Boolean) as Tab[],
    [],
  );

  const activeId = useMemo(() => {
    if (pathname.startsWith('/discover') || pathname === '/' || pathname.startsWith('/explore'))
      return 'discover';
    if (pathname.startsWith('/creators') || pathname.startsWith('/live')) return 'creators';
    if (pathname.startsWith('/calls') || pathname.startsWith('/call-room')) return 'calls';
    if (pathname.startsWith('/content')) return 'content';
    if (pathname.startsWith('/dm')) return 'dm';
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/settings')) return 'dashboard';
    return '';
  }, [pathname]);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <ul className="grid grid-cols-6">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeId === t.id;
          return (
            <li key={t.id}>
              <button
                className={cn(
                  'flex h-14 w-full flex-col items-center justify-center text-xs',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => navigate(t.to)}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={cn('h-5 w-5 mb-0.5', active && 'text-primary')} />
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="h-2" />
    </nav>
  );
}
