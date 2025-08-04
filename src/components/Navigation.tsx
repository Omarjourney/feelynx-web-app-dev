import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Globe } from 'lucide-react';
import feelynxLogo from '@/assets/feelynx-logo.png';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [coins] = useState(2547);

  const tabs = [
    { id: 'explore', label: 'Explore' },
    { id: 'creators', label: 'Creators' },
    { id: 'content', label: 'Content' },
    { id: 'calls', label: 'Calls' },
    { id: 'groups', label: 'Groups' },
    { id: 'coins', label: 'VibeCoins' },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
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
          <div className="flex items-center space-x-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="default"
                onClick={() => onTabChange(tab.id)}
                className={`md:size-sm min-h-11 px-6 py-2 rounded-full transition-all ${
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
            <Button
              variant="outline"
              size="default"
              className="md:size-sm min-h-11 rounded-full"
            >
              Profile
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
