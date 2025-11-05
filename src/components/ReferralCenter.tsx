import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Gift, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { request } from '@/lib/api';

interface ReferralRecord {
  id: string;
  referrerId: string;
  referredId: string;
  referredType: 'creator' | 'fan';
  createdAt: string;
  expiresAt: string;
  bonusTier: 'Growth' | 'Pro' | 'Elite';
  status: 'active' | 'expired';
  earnings: number;
}

interface ReferralSummary {
  totals: {
    creators: number;
    fans: number;
    earnings: number;
  };
  active: ReferralRecord[];
  expired: ReferralRecord[];
  rewardRates: {
    base: number;
    bonus: number;
  };
}

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

const ReferralCenter = () => {
  const { data, isLoading } = useQuery<ReferralSummary>({
    queryKey: ['referrals', 'summary'],
    queryFn: () => request<ReferralSummary>('/api/referrals'),
    staleTime: 60_000,
  });

  const active = data?.active ?? [];
  const totals = data?.totals ?? { creators: 0, fans: 0, earnings: 0 };
  const rewardRates = data?.rewardRates ?? { base: 0.05, bonus: 0 };
  const link = `https://feelynx.tv/i/${active[0]?.referrerId ?? 'creator'}`;

  if (isLoading) {
    return (
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle>Referral Center</CardTitle>
          <CardDescription>Loading viral invite data…</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  const copyLink = () => {
    navigator.clipboard
      .writeText(link)
      .then(() => toast({ title: 'Referral link copied', description: 'Drop this link in your community hubs.' }))
      .catch(() => toast({ title: 'Copy failed', description: 'Try again from a secure browser.', variant: 'destructive' }));
  };

  return (
    <Card className="relative overflow-hidden border border-primary/20 bg-background/90">
      <CardHeader className="space-y-1">
        <Badge variant="secondary" className="w-fit rounded-full bg-primary/20 text-primary">
          +5% Base · +5% Bonus
        </Badge>
        <CardTitle className="text-2xl">Referral Growth Orbit</CardTitle>
        <CardDescription>
          Track who you&apos;ve activated, the 💎 kickbacks they earn, and how close you are to Elite tier bonuses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-primary/10 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">Creators</p>
            <p className="mt-1 text-2xl font-semibold">{totals.creators}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">Fans</p>
            <p className="mt-1 text-2xl font-semibold">{totals.fans}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-emerald-500/10 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">Earnings</p>
            <p className="mt-1 text-2xl font-semibold">{totals.earnings.toLocaleString()} 💎</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={copyLink} className="rounded-full">
            <Gift className="mr-2 h-4 w-4" /> Copy Referral Link
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="rounded-full border-primary/50 text-primary">
                  {formatPercent(rewardRates.base)} base · {formatPercent(rewardRates.bonus)} bonus
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bonus climbs with active invites. Elite unlocks full +5%.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator />

        <div className="space-y-3">
          {active.slice(0, 4).map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {record.referredType === 'creator' ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span className="font-medium">{record.referredId}</span>
                  <Badge variant="secondary" className="rounded-full bg-black/40 text-[11px] uppercase tracking-[0.2em]">
                    {record.referredType}
                  </Badge>
                </div>
                <span>{record.earnings.toLocaleString()} 💎</span>
              </div>
              <p className="text-xs text-white/70">
                Activated {new Date(record.createdAt).toLocaleDateString()} · Expires {new Date(record.expiresAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
          {!active.length && <p className="text-sm text-muted-foreground">No active referrals yet. Invite your inner circle.</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralCenter;
