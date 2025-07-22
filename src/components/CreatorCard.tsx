
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Creator {
  id: number;
  name: string;
  username: string;
  country: string;
  age: number;
  tier: string;
  subscribers: string;
  isLive: boolean;
  viewers?: number;
  toyConnected?: string;
  videoRate: number;
  voiceRate: number;
  specialties: string[];
  earnings: string;
  status: string;
  initial: string;
  gradientColors: string;
}

interface CreatorCardProps {
  creator: Creator;
  onViewProfile: (id: number) => void;
}

export const CreatorCard = ({ creator, onViewProfile }: CreatorCardProps) => {
  return (
    <Card className="bg-gradient-card border-border hover:shadow-premium transition-all duration-300 group overflow-hidden">
      <CardContent className="p-0">
        {/* Avatar Section with Large Initial */}
        <div className={`relative h-48 ${creator.gradientColors} flex items-center justify-center`}>
          {creator.isLive && (
            <Badge className="absolute top-2 left-2 bg-live text-white animate-pulse px-2 py-1 text-xs">
              🔴 LIVE {creator.viewers?.toLocaleString()}
            </Badge>
          )}
          
          {creator.tier && (
            <Badge className="absolute top-2 right-2 bg-gradient-primary text-primary-foreground text-xs">
              {creator.tier}
            </Badge>
          )}
          
          {creator.toyConnected && (
            <Badge className="absolute bottom-2 left-2 bg-black/50 text-white text-xs">
              🎮 {creator.toyConnected}
            </Badge>
          )}
          
          <div className="text-8xl font-bold text-white opacity-90">
            {creator.initial}
          </div>
        </div>

        {/* Creator Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {creator.name}
              </h3>
              <p className="text-sm text-muted-foreground">{creator.username}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">📍 {creator.country}</div>
              <div className="text-sm text-muted-foreground">🎂 {creator.age}</div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            👥 {creator.subscribers}
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1">
            {creator.specialties.slice(0, 2).map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>

          {/* Rates */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">📹</span>
              <span className="text-primary font-medium">{creator.videoRate}💎/min</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">🎤</span>
              <span className="text-primary font-medium">{creator.voiceRate}💎/min</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1 bg-gradient-primary text-primary-foreground hover:shadow-glow"
              onClick={() => onViewProfile(creator.id)}
            >
              {creator.isLive ? "Watch" : "Tip"}
            </Button>
            <Button variant="outline" size="sm" className="px-3">
              💬
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
