import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useMonetization } from '@/hooks/useMonetization';

interface TokenEarningsProps {
  creatorId?: string;
}

const glowTransition = {
  type: 'spring',
  stiffness: 120,
  damping: 18,
};

export const TokenEarnings = ({ creatorId }: TokenEarningsProps) => {
  const { data, isLoading, isFetching, refetch, tokensPerSecond } = useMonetization(creatorId);
  const [isGlowing, setIsGlowing] = useState(false);
  const previousEarnings = useRef<number | null>(null);

  useEffect(() => {
    if (typeof data?.sessionEarnings !== 'number') return;
    const previous = previousEarnings.current;
    previousEarnings.current = data.sessionEarnings;

    if (previous !== null && data.sessionEarnings > previous) {
      setIsGlowing(true);
      const timeout = setTimeout(() => setIsGlowing(false), 1200);
      return () => clearTimeout(timeout);
    }

    setIsGlowing(false);
    return undefined;
  }, [data?.sessionEarnings]);

  const formattedEarnings = useMemo(() => {
    if (typeof data?.sessionEarnings !== 'number') return '—';
    return data.sessionEarnings.toLocaleString();
  }, [data?.sessionEarnings]);

  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        animate={{ opacity: isGlowing ? 0.6 : 0 }}
        transition={glowTransition}
        style={{ background: 'radial-gradient(circle at top, rgba(147, 51, 234, 0.35), transparent 55%)' }}
      />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Live Token Earnings
          </CardTitle>
          <p className="text-3xl font-semibold text-foreground">
            {isLoading ? '…' : `${formattedEarnings} 💎`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                Sync now
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">You&apos;ve earned {formattedEarnings} tokens this session</TooltipContent>
          </Tooltip>
          <span className="text-xs text-muted-foreground">
            {isFetching ? 'Refreshing…' : data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Awaiting data'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-background/60 p-4 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Token flow</p>
            <p className="text-xl font-semibold text-foreground">
              {data ? data.tokenFlow.toLocaleString() : '—'} <span className="text-base font-normal text-muted-foreground">per min</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Viewer count</p>
            <p className="text-xl font-semibold text-foreground">{data ? data.viewerCount.toLocaleString() : '—'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">💎 Tokens / sec</p>
            <p className="text-2xl font-semibold text-foreground">{tokensPerSecond.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-foreground">Session ID</p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {data?.creatorId ?? creatorId ?? 'demo-creator'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenEarnings;
