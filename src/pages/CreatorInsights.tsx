import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TokenEarnings from '@/components/TokenEarnings';
import ReactionMeter from '@/components/ReactionMeter';
import { useMonetization } from '@/hooks/useMonetization';
import { useEmotionalAI } from '@/hooks/useEmotionalAI';
import { cn } from '@/lib/utils';

const CREATOR_ID = 'demo-creator';

const CreatorInsights = () => {
  const monetization = useMonetization(CREATOR_ID);
  const emotional = useEmotionalAI(CREATOR_ID);

  const chartData = useMemo(
    () =>
      emotional.history.map((entry) => ({
        time: new Date(entry.timestamp).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
        score: entry.engagementScore,
      })),
    [emotional.history],
  );

  const lastUpdated = monetization.data?.timestamp ?? emotional.data?.timestamp;
  const isSyncing = monetization.isFetching || emotional.isFetching;

  const handleManualSync = async () => {
    await Promise.all([monetization.refetch(), emotional.refetch()]);
  };

  return (
    <div className="container mx-auto space-y-8 p-4">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Creator Insights</h1>
          <p className="text-muted-foreground">
            Real-time monetization, engagement, and emotional analytics for your live session.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-primary/20 text-primary">
            👥 Viewers • {monetization.data ? monetization.data.viewerCount.toLocaleString() : '—'}
          </Badge>
          <Badge variant="secondary" className="bg-secondary/30 text-secondary-foreground">
            🧠 Mood • {emotional.data?.mood ?? 'Calibrating'}
          </Badge>
          <Button variant="outline" onClick={handleManualSync} disabled={isSyncing}>
            {isSyncing ? 'Syncing…' : 'Manual sync'}
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TokenEarnings creatorId={CREATOR_ID} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Engagement trend</CardTitle>
                <p className="text-sm text-muted-foreground">AI sentiment tracking over the last minute</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : 'Awaiting data'}
              </span>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: 8, right: 8, top: 12, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
                  <ChartTooltip cursor={false} />
                  <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <ReactionMeter
            score={emotional.data?.engagementScore ?? 0}
            mood={emotional.data?.mood ?? 'calm'}
            sentimentTrend={emotional.data?.sentimentTrend ?? 'steady'}
            animationState={emotional.animationState}
          />
          <Card className="backdrop-blur">
            <CardHeader>
              <CardTitle>Session signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Emotional state</p>
                  <p className="text-lg font-semibold text-foreground capitalize">{emotional.data?.mood ?? 'calm'}</p>
                </div>
                <Badge className={cn('capitalize', emotional.animationState === 'hype' ? 'bg-orange-500/30 text-orange-500' : 'bg-primary/20 text-primary')}>
                  {emotional.animationState}
                </Badge>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Tokens earned</p>
                  <p className="text-lg font-semibold text-foreground">
                    {monetization.data ? monetization.data.sessionEarnings.toLocaleString() : '—'} 💎
                  </p>
                </div>
                <span>
                  {monetization.data?.tokenFlow ? `${monetization.data.tokenFlow.toLocaleString()} tokens/min` : '—'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Sentiment trend</p>
                  <p className="text-lg font-semibold text-foreground capitalize">
                    {emotional.data?.sentimentTrend ?? 'steady'}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  AI moderation ready for appeal triggers at <strong>score &lt; 40</strong>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatorInsights;
