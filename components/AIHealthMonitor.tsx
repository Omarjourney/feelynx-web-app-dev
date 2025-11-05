import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { request } from '@/lib/api';
import { useTranslation } from '@/contexts/I18nContext';

interface AiOpsMetrics {
  latencyMs: number;
  engagement: number;
  tokenVelocity: number;
  lastOptimizedAt: number;
  recommendations: Array<{ id: string; focus: string; impact: string; explanation: string }>;
}

const normalize = (value: number, max: number) => Math.min(100, Math.round((value / max) * 100));

const AIHealthMonitor = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<AiOpsMetrics | null>(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await request<AiOpsMetrics>('/api/aiops');
      setMetrics(response);
      setExplanation(response.recommendations[0]?.explanation ?? '');
    } catch (error) {
      console.error('Unable to load aiops metrics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('aiHealth.title')}</CardTitle>
        <CardDescription>{t('aiHealth.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!metrics && <p className="text-sm text-muted-foreground">{t('creatorHub.loading')}</p>}
        {metrics && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>{t('aiHealth.latency')}</span>
                <span>{metrics.latencyMs} ms</span>
              </div>
              <Progress value={normalize(250 - metrics.latencyMs, 250)} />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>{t('aiHealth.engagement')}</span>
                <span>{(metrics.engagement * 100).toFixed(1)}%</span>
              </div>
              <Progress value={normalize(metrics.engagement, 1)} />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>{t('aiHealth.tokenVelocity')}</span>
                <span>{metrics.tokenVelocity.toFixed(0)} / min</span>
              </div>
              <Progress value={normalize(metrics.tokenVelocity, 120)} />
            </div>
            <div className="text-xs text-muted-foreground">
              {t('aiHealth.lastUpdated')}: {new Date(metrics.lastOptimizedAt).toLocaleTimeString()}
            </div>
            <div>
              <p className="text-sm font-semibold">{t('aiHealth.recommendations')}</p>
              <ul className="mt-2 space-y-2 text-sm">
                {metrics.recommendations.length === 0 && <li>{t('aiHealth.noRecommendations')}</li>}
                {metrics.recommendations.map((item) => (
                  <li key={item.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.focus}</p>
                        <p className="text-xs text-muted-foreground">{item.impact}</p>
                      </div>
                      <Badge variant="secondary">AIOps</Badge>
                    </div>
                    <Button size="sm" variant="ghost" className="mt-2 h-8 px-3" onClick={() => setExplanation(item.explanation)}>
                      {t('aiHealth.explain')}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {explanation && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-primary">
            {explanation}
          </div>
        )}
      </CardContent>
      <div className="flex items-center justify-between border-t px-6 py-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">AutonomyNet</p>
        <Button size="sm" onClick={fetchMetrics} disabled={loading}>
          {loading ? t('creatorHub.loading') : t('fanFeed.refresh')}
        </Button>
      </div>
    </Card>
  );
};

export default AIHealthMonitor;
