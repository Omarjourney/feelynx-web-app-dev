import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import feelynxWordmark from '@/assets/feelynx-wordmark.svg';

const links = [
  { to: '/', label: 'Home' },
  { to: '/call-room', label: 'Go Live' },
  { to: '/token-shop', label: 'Buy Coins' },
  { to: '/dashboard', label: 'Dashboard' },
];

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };
  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 pt-safe px-safe">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/" aria-label="Go to Home">
            <img src={feelynxWordmark} alt="Feelynx" className="h-8 w-auto" />
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          {links.map((l) => (
            <Button key={l.to} asChild variant={location.pathname === l.to ? 'default' : 'ghost'}>
              <Link to={l.to}>{l.label}</Link>
            </Button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant="secondary"
            className="bg-gradient-primary text-primary-foreground px-3 py-1"
          >
            💎 0
          </Badge>
          {user ? (
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
          )}
          <button
            className="md:hidden flex items-center justify-center min-h-11 min-w-11"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="flex flex-col space-y-2 pb-4 md:hidden container mx-auto px-4">
          {links.map((l) => (
            <Button
              key={l.to}
              asChild
              variant={location.pathname === l.to ? 'default' : 'ghost'}
              className="rounded-full min-h-11 min-w-11 justify-start"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link to={l.to}>{l.label}</Link>
            </Button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
