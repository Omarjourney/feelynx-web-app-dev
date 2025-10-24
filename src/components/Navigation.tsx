import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Globe, Menu } from 'lucide-react';
import feelynxLogo from '@/assets/feelynx-logo.png';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [coins] = useState(2547);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'explore', label: 'Explore' },
    { id: 'creators', label: 'Creators' },
    { id: 'content', label: 'Content' },
    { id: 'calls', label: 'Calls' },
    { id: 'groups', label: 'Groups' },
    { id: 'coins', label: 'VibeCoins' },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 pt-safe px-safe">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src={feelynxLogo} alt="Feelynx" className="w-8 h-8" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              eelynx
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="default"
                onClick={() => onTabChange(tab.id)}
                className={`min-h-11 min-w-11 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <Button
              variant="ghost"
              size="default"
              className="md:size-sm min-h-11 flex items-center space-x-1"
            >
              <Globe className="w-4 h-4" />
              <span>EN</span>
              <ChevronDown className="w-3 h-3" />
            </Button>

            {/* VibeCoins */}
            <Badge
              variant="secondary"
              className="bg-gradient-primary text-primary-foreground px-3 py-1"
            >
              💎 {coins.toLocaleString()}
            </Badge>

            {/* Profile */}
            <Button variant="outline" size="default" className="md:size-sm min-h-11 rounded-full">
              Profile
            </Button>

            {/* Mobile Menu Button */}
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
          <div className="flex flex-col space-y-2 pb-4 md:hidden">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  onTabChange(tab.id);
                  setIsMenuOpen(false);
                }}
                className={`min-h-11 min-w-11 justify-start rounded-full ${
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
