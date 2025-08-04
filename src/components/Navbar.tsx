import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import feelynxLogo from '@/assets/feelynx-logo.png';

const links = [
  { to: '/', label: 'Home' },
  { to: '/call-room', label: 'Go Live' },
  { to: '/token-shop', label: 'Buy Coins' },
  { to: '/dashboard', label: 'Dashboard' },
];

const Navbar = () => {
  const location = useLocation();
  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center space-x-2">
          <img src={feelynxLogo} alt="Feelynx" className="w-8 h-8" />
          <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            eelynx
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {links.map((l) => (
            <Button
              key={l.to}
              asChild
              variant={location.pathname === l.to ? 'default' : 'ghost'}
              size="default"
              className="md:size-sm min-h-11 rounded-full px-4"
            >
              <Link to={l.to}>{l.label}</Link>
            </Button>
          ))}
        </div>
        <Badge
          variant="secondary"
          className="bg-gradient-primary text-primary-foreground px-3 py-1"
        >
          💎 0
        </Badge>
      </div>
    </nav>
  );
};

export default Navbar;
