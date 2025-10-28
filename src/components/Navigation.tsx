import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Globe, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FEATURES } from '@/config';
import feelynxLogo from '@/assets/feelynx-logo.png';
import PreviewBanner from '@/components/PreviewBanner';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [coins] = useState(2547);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'discover', label: 'Discover' },
    FEATURES.live && { id: 'creators', label: 'Live' },
    FEATURES.calls && { id: 'calls', label: 'Calls' },
    FEATURES.content && { id: 'content', label: 'Content' },
    { id: 'dm', label: 'Messages' },
    { id: 'dashboard', label: 'Profile' },
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-0 left-0 m-4">
        Skip to content
      </a>
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

              {/* More menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="default"
                    className="md:size-sm min-h-11 rounded-full"
                  >
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>More</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {FEATURES.groups && (
                    <DropdownMenuItem onClick={() => onTabChange('groups')}>
                      Groups
                    </DropdownMenuItem>
                  )}
                  {FEATURES.patterns && (
                    <DropdownMenuItem onClick={() => onTabChange('patterns')}>
                      Patterns
                    </DropdownMenuItem>
                  )}
                  {FEATURES.remote && (
                    <DropdownMenuItem onClick={() => onTabChange('remote')}>
                      Remote
                    </DropdownMenuItem>
                  )}
                  {FEATURES.companions && (
                    <DropdownMenuItem onClick={() => onTabChange('companions')}>
                      Companions
                    </DropdownMenuItem>
                  )}
                  {FEATURES.contests && (
                    <DropdownMenuItem onClick={() => onTabChange('contests')}>
                      Contests
                    </DropdownMenuItem>
                  )}
                  {FEATURES.shop && (
                    <DropdownMenuItem onClick={() => onTabChange('token-shop')}>
                      Shop
                    </DropdownMenuItem>
                  )}
                  {FEATURES.settings && (
                    <DropdownMenuItem onClick={() => onTabChange('settings')}>
                      Settings
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

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
      {/* Preview banner shows environment/feature availability for hosted previews */}
      <PreviewBanner />
    </>
  );
};
