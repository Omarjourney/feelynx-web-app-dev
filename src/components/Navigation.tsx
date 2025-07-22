import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import feelynxLogo from "@/assets/feelynx-logo.png";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const [coins] = useState(2547);

  const tabs = [
    { id: "explore", label: "Explore", icon: "🌍" },
    { id: "creators", label: "Creators", icon: "⭐" },
    { id: "content", label: "Content", icon: "📸" },
    { id: "calls", label: "Calls", icon: "📹" },
    { id: "coins", label: "Coins", icon: "💎" }
  ];

  return (
    <nav className="bg-gradient-card border-b border-border backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src={feelynxLogo} alt="Feelynx" className="w-8 h-8" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Feelynx
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 ${
                  activeTab === tab.id 
                    ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
              💎 {coins.toLocaleString()}
            </Badge>
            <Button variant="outline" size="sm">
              Profile
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};