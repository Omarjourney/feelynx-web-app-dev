import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Compass, Radio, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import FeelynxLogo from '@/components/brand/FeelynxLogo';

type NavItem = {
  id: 'home' | 'discover' | 'go-live' | 'profile';
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'discover', label: 'Discover', to: '/discover', icon: Compass },
  { id: 'go-live', label: 'Go Live', to: '/call-room', icon: Radio },
  { id: 'profile', label: 'Profile', to: '/dashboard', icon: UserRound },
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };
  const activeItem = useMemo<NavItem>(() => {
    if (location.pathname === '/' || location.pathname === '/index') return navItems[0];
    if (location.pathname.startsWith('/discover') || location.pathname.startsWith('/explore'))
      return navItems[1];
    if (location.pathname.startsWith('/live') || location.pathname.startsWith('/call-room'))
      return navItems[2];
    if (
      location.pathname.startsWith('/dashboard') ||
      location.pathname.startsWith('/settings') ||
      location.pathname.startsWith('/dm')
    )
      return navItems[3];
    return navItems[1];
  }, [location.pathname]);

  const handleNavigate = (item: NavItem) => {
    if (item.id === 'profile' && !user) {
      navigate('/auth');
      return;
    }
    navigate(item.to);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[calc(var(--safe-area-bottom)+1.5rem)] md:pb-[calc(var(--safe-area-bottom)+2.5rem)]">
      <motion.nav
        layout
        className="pointer-events-auto relative w-full max-w-xl px-4 md:px-6"
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          layout
          className="glass-elevated relative flex items-center justify-between gap-2 md:gap-3 rounded-[var(--radius-card)] px-3 md:px-4 py-2.5 md:py-3 backdrop-blur-2xl"
        >
          <motion.div
            className="absolute -top-10 md:-top-12 left-0 right-0 flex items-center justify-between px-3 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] text-white/70"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="glass-chip !px-2.5 md:!px-3 !py-1.5 text-[10px] md:text-[11px] font-semibold text-white/80">
              💎 <span className="ml-1">0/min</span>
            </span>
            {user ? (
              <button onClick={handleSignOut} className="glass-chip hover:text-white text-[10px] md:text-[11px]" type="button">
                Sign out
              </button>
            ) : (
              <Link to="/auth" className="glass-chip hover:text-white text-[10px] md:text-[11px]">
                Sign in
              </Link>
            )}
          </motion.div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeItem.id;
            const isGoLive = item.id === 'go-live';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item)}
                className={cn(
                  'relative flex flex-1 flex-col items-center gap-0.5 md:gap-1 text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 transition min-h-11 md:min-h-12',
                  isActive && 'text-white',
                )}
              >
                <motion.span
                  layoutId="nav-item"
                  className={cn(
                    'absolute inset-x-1 md:inset-x-2 top-0 h-9 md:h-10 rounded-full bg-white/0 blur-lg',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                <div
                  className={cn(
                    'relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 shadow-[0_10px_35px_-20px_rgba(0,0,0,0.9)] backdrop-blur-lg transition-all duration-300',
                    isActive && 'bg-gradient-primary text-white shadow-glow',
                    isGoLive && 'h-12 w-12 md:h-14 md:w-14 -mt-3 md:-mt-4 shadow-glow-strong',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 md:h-5 md:w-5',
                      isActive && 'drop-shadow-[0_0_12px_rgba(255,255,255,0.65)]',
                    )}
                  />
                  {isGoLive && (
                    <span className="pointer-events-none absolute -bottom-2 md:-bottom-3 rounded-full bg-white/10 px-2 md:px-3 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">
                      Live
                    </span>
                  )}
                </div>
                <span className="hidden sm:block">{item.label}</span>
              </button>
            );
          })}
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-x-4 md:inset-x-6 -bottom-6 md:-bottom-8 h-10 md:h-12 rounded-full bg-gradient-primary opacity-60 blur-[40px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        />
        <motion.div
          className="pointer-events-none absolute inset-x-0 -top-12 md:-top-14 flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <FeelynxLogo size={80} className="md:hidden" glow={false} />
          <FeelynxLogo size={96} className="hidden md:block" glow={false} />
        </motion.div>
      </motion.nav>
    </div>
  );
};
