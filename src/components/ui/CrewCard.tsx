import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import LiveBadge from '@/components/LiveBadge';

interface CrewCardProps {
  crew: {
    id: string | number;
    name: string;
    members: number;
    description: string;
    isLive?: boolean;
    xpReward?: number;
  };
  onJoin?: (id: string | number) => void;
}

export const CrewCard = ({ crew, onJoin }: CrewCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-card border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{crew.name}</h3>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">
              Crew · {crew.members.toLocaleString()} members
            </p>
          </div>
          {crew.isLive && (
            <Badge className="glass-chip animate-pulse-ring border-white/20 bg-pink-500/15 text-xs text-pink-100">
              Live
            </Badge>
          )}
        </div>

        <CardContent className="mt-4 space-y-4 p-0">
          <p className="line-clamp-3 text-sm leading-relaxed text-white/70">{crew.description}</p>

          {crew.xpReward && (
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Daily quests ready</span>
              <Badge className="glass-chip !border-white/20 !bg-white/10 text-xs text-white/80">
                +{crew.xpReward} XP
              </Badge>
            </div>
          )}

          <Button
            className="w-full rounded-full bg-gradient-primary text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
            onClick={() => onJoin?.(crew.id)}
            aria-label={`Join ${crew.name} crew`}
            tabIndex={0}
          >
            Enter crew space
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
