import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Crown, Flame, Zap } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { request } from '@/lib/api';

interface LeaderboardEntry {
  creatorId: string;
  creatorName: string;
  avatar?: string;
  weeklyTokens: number;
  streakDays: number;
  tier: 'Growth' | 'Pro' | 'Elite';
  lastShareRate?: number;
  rank: number;
  streakBadge?: string | null;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
}

const tierAccent: Record<LeaderboardEntry['tier'], string> = {
  Growth: 'from-emerald-500/40 via-emerald-600/30 to-emerald-900/30',
  Pro: 'from-indigo-500/40 via-violet-500/30 to-blue-900/20',
  Elite: 'from-amber-400/40 via-orange-500/30 to-red-900/30',
};

const tierIcon: Record<LeaderboardEntry['tier'], JSX.Element> = {
  Growth: <Zap className="h-4 w-4" />, 
  Pro: <Flame className="h-4 w-4" />,
  Elite: <Crown className="h-4 w-4" />,
};

const Leaderboard = () => {
  const { data, isLoading } = useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard', 'weekly'],
    queryFn: () => request<LeaderboardResponse>('/api/leaderboard'),
    staleTime: 60_000,
  });

  const entries = useMemo(() => data?.entries ?? [], [data?.entries]);

  if (isLoading) {
    return (
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="text-lg">Top Creators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-background/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          Weekly 💎 Leaderboard
          <Badge variant="outline" className="rounded-full border-primary/40 text-xs uppercase tracking-[0.3em]">
            Virality Pulse
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.creatorId}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'relative overflow-hidden rounded-3xl border border-white/10 p-4 shadow-lg backdrop-blur-sm',
              'bg-gradient-to-r',
              tierAccent[entry.tier],
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-sm font-semibold text-white/80">
                #{entry.rank}
              </div>
              <Avatar className="h-12 w-12 border border-white/40">
                <AvatarImage src={entry.avatar} alt={entry.creatorName} />
                <AvatarFallback>{entry.creatorName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-white">{entry.creatorName}</p>
                  <Badge variant="secondary" className="flex items-center gap-1 rounded-full bg-white/10 text-xs text-white/80">
                    {tierIcon[entry.tier]}
                    {entry.tier}
                  </Badge>
                  {entry.streakBadge ? (
                    <Badge variant="outline" className="rounded-full border-white/60 text-[11px] text-white/70">
                      {entry.streakBadge}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-white/70">
                  {entry.weeklyTokens.toLocaleString()} 💎 this week · {entry.streakDays}-day streak
                </p>
              </div>
              <div className="text-right text-xs text-white/70">
                <p>Share rate</p>
                <p className="text-sm font-semibold text-white">
                  {entry.lastShareRate ? `${Math.round(entry.lastShareRate * 100)}%` : '—'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        <Separator className="bg-white/10" />
        <p className="text-xs text-muted-foreground">
          Streak badges ignite at 3, 7, and 14 consecutive days of going live. Keep the rhythm to ride the Elite glow.
        </p>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
