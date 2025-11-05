import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { request } from '@/lib/api';
import { useTranslation } from '@/contexts/I18nContext';

interface FanCompanionResponse {
  recommendations: Array<{
    id: string;
    title: string;
    type: 'creator' | 'event' | 'pack';
    description: string;
    explanation: string;
  }>;
}

const badgeMap: Record<string, string> = {
  creator: 'Creator',
  event: 'Event',
  pack: 'Token Pack',
};

const FanVibeFeed = () => {
  const { t } = useTranslation();
  const [explanation, setExplanation] = useState<string>('');

  const { data, refetch, isFetching } = useQuery({
    queryKey: ['fan-agent'],
    queryFn: () =>
      request<FanCompanionResponse>('/api/agent/fan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'vibeFeed' }),
      }),
    staleTime: 60_000,
  });

  const feed = useMemo(() => data?.recommendations ?? [], [data]);

  useEffect(() => {
    if (feed.length) {
      setExplanation(feed[0]?.explanation ?? '');
    }
  }, [feed]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('fanFeed.title')}</CardTitle>
        <CardDescription>{t('fanFeed.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {feed.length === 0 && <p className="text-sm text-muted-foreground">{t('fanFeed.empty')}</p>}
        {feed.map((item) => (
          <div key={item.id} className="rounded-lg border bg-background p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-base font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Badge variant="outline">{badgeMap[item.type] ?? item.type}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {item.type === 'pack' && (
                <Button size="sm" variant="secondary">
                  {t('fanFeed.redeem')}
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setExplanation(item.explanation)}>
                {t('creatorHub.explanation')}
              </Button>
            </div>
          </div>
        ))}
        {explanation && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-primary">
            {explanation}
          </div>
        )}
      </CardContent>
      <div className="flex items-center justify-between border-t px-6 py-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">AIAutonomy</p>
        <Button size="sm" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? t('creatorHub.loading') : t('fanFeed.refresh')}
        </Button>
      </div>
    </Card>
  );
};

export default FanVibeFeed;
