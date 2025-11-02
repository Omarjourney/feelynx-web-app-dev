import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LifeBuoy, Users2, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FeelynxLogo from '@/components/brand/FeelynxLogo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsDrawer } from '@/components/ui/SettingsDrawer';

const navItems = [
  { id: 'discover', label: 'Discover', to: '/discover', icon: Compass },
  { id: 'community', label: 'Community', to: '/groups', icon: Users2 },
  { id: 'support', label: 'Support', to: '/token-shop', icon: LifeBuoy },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeId = useMemo(() => {
    if (location.pathname === '/' || location.pathname === '/index') return 'discover';
    const found = navItems.find((item) => location.pathname.startsWith(item.to));
    return found?.id ?? 'discover';
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 rounded-full px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
            <FeelynxLogo size={48} glow={false} />
            <span className="hidden text-sm font-semibold uppercase tracking-[0.3em] text-foreground/70 sm:inline">
              Feelynx
            </span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                      (isActive || activeId === item.id) && 'bg-white/10 text-foreground',
                    )
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <SettingsDrawer />
          {user ? (
            <Button
              type="button"
              variant="ghost"
              className="rounded-full px-4 py-2 text-sm text-foreground/70 hover:bg-white/10"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              Sign out
            </Button>
          ) : (
            <Button
              type="button"
              className="rounded-full px-4 py-2"
              onClick={() => navigate('/auth')}
              aria-label="Sign in"
            >
              Sign in
            </Button>
          )}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/10 p-2 text-foreground transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="md:hidden" id="mobile-nav">
        {isMobileMenuOpen && (
          <div className="space-y-3 border-t border-white/10 px-6 pb-6 pt-4">
            <nav className="flex flex-col gap-2" aria-label="Primary mobile">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={activeId === item.id ? 'default' : 'ghost'}
                  className="justify-start rounded-full px-4 py-2 text-sm"
                  onClick={() => {
                    navigate(item.to);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
