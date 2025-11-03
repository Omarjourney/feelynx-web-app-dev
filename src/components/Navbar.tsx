import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Compass, Radio, UserRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-safe">
      <motion.nav
        layout
        className="relative w-full max-w-xl px-4 sm:px-6 pb-4 sm:pb-6"
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Main Nav Bar */}
        <motion.div
          layout
          className="glass-elevated relative flex items-center justify-between gap-2 sm:gap-3 rounded-[var(--radius-card)] px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-2xl"
        >
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
                  'relative flex flex-1 flex-col items-center gap-1 text-[10px] sm:text-xs font-medium text-white/60 min-h-[52px] sm:min-h-[56px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg motion-safe:transition-all motion-safe:duration-200',
                  isActive && 'text-white',
                )}
              >
                <div
                  className={cn(
                    'relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-lg motion-safe:transition-all motion-safe:duration-300',
                    isActive && 'bg-gradient-primary text-white shadow-glow border-white/20',
                    isGoLive && 'h-12 w-12 sm:h-13 sm:w-13 shadow-glow',
                  )}
                >
                  <Icon className={cn('h-5 w-5 sm:h-5.5 sm:w-5.5')} />
                </div>
                <span className={cn('text-[10px] sm:text-xs', isActive && 'font-semibold')}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Glow Effect */}
        <motion.div
          className="pointer-events-none absolute inset-x-4 sm:inset-x-6 -bottom-2 h-8 rounded-full bg-gradient-primary opacity-40 blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        />
      </motion.nav>

      {/* Coins and Auth - Moved to top-right corner instead */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <span className="glass-chip text-xs font-semibold text-white/80">
          💎 <span className="ml-1">0/min</span>
        </span>
        {user ? (
          <button
            onClick={handleSignOut}
            className="glass-chip hover:text-white text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[36px] px-3 motion-safe:transition-colors motion-safe:duration-300"
            type="button"
          >
            Sign out
          </button>
        ) : (
          <Link
            to="/auth"
            className="glass-chip hover:text-white text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[36px] px-3 flex items-center motion-safe:transition-colors motion-safe:duration-300"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
};
