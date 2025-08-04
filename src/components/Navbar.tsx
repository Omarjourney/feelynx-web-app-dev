import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import feelynxLogo from '@/assets/feelynx-logo.png';

const links = [
  { to: '/', label: 'Home' },
  { to: '/call-room', label: 'Go Live' },
  { to: '/token-shop', label: 'Buy Coins' },
  { to: '/dashboard', label: 'Dashboard' },
];

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src={feelynxLogo} alt="Feelynx" className="w-8 h-8" />
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            eelynx
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          {links.map((l) => (
            <Button
              key={l.to}
              asChild
              variant={location.pathname === l.to ? 'default' : 'ghost'}
            >
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
