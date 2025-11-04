import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ApiError, isApiError, request } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface DayMetrics {
  date: string;
  viewer_count: number;
  gift_revenue: number;
  subscriber_churn: number;
}

const Analytics = () => {
  const [data, setData] = useState<DayMetrics[]>([]);
  const [comparison, setComparison] = useState({ viewer: 0, revenue: 0, churn: 0 });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const json = await request<{ perDay?: Record<string, Omit<DayMetrics, 'date'>> }>(
          '/analytics/creators/demo/daily',
        );
        const perDay = json.perDay || {};
        const arr: DayMetrics[] = Object.entries(perDay)
          .map(([date, metrics]) => ({
            date,
            ...metrics,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
        setData(arr);
        if (arr.length > 1) {
          const last = arr[arr.length - 1];
          const prev = arr[arr.length - 2];
          setComparison({
            viewer: last.viewer_count - prev.viewer_count,
            revenue: last.gift_revenue - prev.gift_revenue,
            churn: last.subscriber_churn - prev.subscriber_churn,
          });
        }
      } catch (error) {
        const apiError: ApiError | undefined = isApiError(error) ? error : undefined;
        console.error('Failed to load analytics data', error);
        if (apiError) {
          console.debug('API error details:', apiError);
        }
      }
    };
    loadAnalytics();
  }, []);

  const tips: string[] = [];
  if (comparison.viewer < 0) {
    tips.push('Viewer count dropped. Promote your next stream ahead of time.');
  }
  if (comparison.revenue < 0) {
    tips.push('Gift revenue decreased. Engage with viewers to encourage gifting.');
  }
  if (comparison.churn > 0) {
    tips.push('Subscriber churn increased. Consider offering exclusive perks.');
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Viewer Count Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="viewer_count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gift Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="gift_revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscriber Churn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="subscriber_churn" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Comparison with previous period:</p>
          <ul className="list-disc pl-5 text-sm mb-2">
            <li>
              Viewer change: {comparison.viewer >= 0 ? '+' : ''}
              {comparison.viewer}
            </li>
            <li>
              Revenue change: {comparison.revenue >= 0 ? '+' : ''}
              {comparison.revenue}
            </li>
            <li>
              Churn change: {comparison.churn >= 0 ? '+' : ''}
              {comparison.churn}
            </li>
          </ul>
          {tips.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Great job! Metrics improved over last stream.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
