import React from 'react';
import { ArrowRightLeft, ArrowUpRight, Coins } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export interface WalletDashboardProps {
  balances: {
    tokens: number;
    fiatUsd: number;
    totalUsdEquivalent: number;
  };
  currentRate: number;
  trailingSeven: {
    tokens: number;
    usd: number;
    dailyBreakdown: Array<{ date: string; tokens: number; usd: number }>;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    reference: string;
    usdEquivalent: number;
    amount: number;
    currency: 'USD' | 'TOKENS';
    timestamp: string;
  }>;
  payoutLog?: Array<{
    id: string;
    status: 'pending' | 'processing' | 'completed';
    amountUsd: number;
    currency: string;
    method?: string;
    requestedAt: string;
  }>;
  onConvert?: () => void;
  onWithdraw?: () => void;
  isLoading?: boolean;
}

const chartConfig = {
  usd: {
    label: 'USD',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const statusIntent: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-600 border-amber-500/40',
  processing: 'bg-sky-500/20 text-sky-600 border-sky-500/40',
  completed: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/40',
};

export const WalletDashboard: React.FC<WalletDashboardProps> = ({
  balances,
  currentRate,
  trailingSeven,
  recentTransactions,
  payoutLog = [],
  onConvert,
  onWithdraw,
  isLoading,
}) => {
  const dailyData = trailingSeven.dailyBreakdown.map((day) => ({
    date: day.date.slice(5),
    usd: Number(day.usd.toFixed(2)),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <Card className="border-primary/10 shadow-lg shadow-primary/10">
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Coins className="h-6 w-6 text-primary" /> Unified Wallet
            </CardTitle>
            <CardDescription>Control 💎 velocity, cash flow and payouts from one secure cockpit.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline" className="border-primary/40 text-primary">
              1 💎 = ${currentRate.toFixed(2)}
            </Badge>
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
              7-day +{(((trailingSeven.usd / Math.max(1, balances.totalUsdEquivalent)) * 100).toFixed(1))}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric
              label="Total Power"
              value={`$${balances.totalUsdEquivalent.toLocaleString()}`}
              helper={`${balances.tokens.toLocaleString()} 💎 + $${balances.fiatUsd.toLocaleString()}`}
            />
            <Metric
              label="💎 Reserve"
              value={balances.tokens.toLocaleString()}
              helper={`${(balances.tokens * currentRate).toFixed(2)} USD potential`}
            />
            <Metric
              label="Fiat Vault"
              value={`$${balances.fiatUsd.toLocaleString()}`}
              helper="Ready for instant withdraw"
            />
          </div>

          <ChartContainer config={chartConfig} className="h-64 w-full">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="wallet-earnings" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${value}`} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="usd"
                stroke="hsl(var(--chart-1))"
                fill="url(#wallet-earnings)"
              />
            </AreaChart>
          </ChartContainer>

          <div className="flex flex-wrap gap-3">
            <Button onClick={onConvert} variant="default" disabled={isLoading} className="gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Convert
            </Button>
            <Button onClick={onWithdraw} variant="outline" disabled={isLoading} className="gap-2">
              <ArrowUpRight className="h-4 w-4" /> Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/5">
        <CardHeader>
          <CardTitle className="text-xl">Payout Flow</CardTitle>
          <CardDescription>Track Stripe + Coinbase journeys in real time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-64 pr-4">
            <div className="space-y-4">
              {payoutLog.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payouts yet. Trigger one to kickstart momentum.</p>
              ) : (
                payoutLog.map((payout) => (
                  <div key={payout.id} className="rounded-lg border border-border/60 p-4">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>{new Date(payout.requestedAt).toLocaleDateString()}</span>
                      <span>${payout.amountUsd.toLocaleString()} {payout.currency}</span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between text-sm">
                      <div className="space-y-1">
                        <p className="font-semibold">{payout.method?.toUpperCase() ?? 'STRIPE CONNECT'}</p>
                        <p className="text-muted-foreground">
                          {payout.status === 'completed'
                            ? 'Completed — funds landed.'
                            : payout.status === 'processing'
                              ? 'Processing — bank is syncing funds.'
                              : 'Pending — compliance check in-flight.'}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn('border px-3 py-1 text-xs uppercase', statusIntent[payout.status])}
                      >
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl">Ledger Timeline</CardTitle>
          <CardDescription>Every 💎 moment recorded with USD sync for tax-ready exports.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-semibold">When</th>
                <th className="px-4 py-2 font-semibold">Reference</th>
                <th className="px-4 py-2 font-semibold">Type</th>
                <th className="px-4 py-2 font-semibold text-right">Amount</th>
                <th className="px-4 py-2 font-semibold text-right">USD</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-border/60">
                  <td className="px-4 py-3">{new Date(transaction.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{transaction.reference}</td>
                  <td className="px-4 py-3 capitalize">{transaction.type}</td>
                  <td className="px-4 py-3 text-right">
                    {transaction.currency === 'TOKENS'
                      ? `${transaction.amount.toLocaleString()} 💎`
                      : `$${transaction.amount.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-3 text-right">${transaction.usdEquivalent.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

const Metric = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
  <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 p-4">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="mt-2 text-2xl font-semibold">{value}</p>
    <p className="text-xs text-muted-foreground">{helper}</p>
  </div>
);

export default WalletDashboard;
