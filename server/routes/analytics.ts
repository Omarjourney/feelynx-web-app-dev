import { Router } from 'express';
import { supabase } from '../db/supabase';

interface StreamStat {
  viewer_count: number | null;
  gift_revenue: number | null;
  subscriber_churn: number | null;
  created_at?: string | null;
}

const router = Router();

// Aggregate metrics for a single stream
router.get('/streams/:streamId', async (req, res) => {
  const { streamId } = req.params;

  const { data, error } = await supabase.from('stream_stats').select('*').eq('stream_id', streamId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const metrics = (data as StreamStat[] | null)?.reduce(
    (acc, row) => {
      acc.viewer_count += row.viewer_count || 0;
      acc.gift_revenue += row.gift_revenue || 0;
      acc.subscriber_churn += row.subscriber_churn || 0;
      return acc;
    },
    { viewer_count: 0, gift_revenue: 0, subscriber_churn: 0 },
  ) || { viewer_count: 0, gift_revenue: 0, subscriber_churn: 0 };

  res.json({ streamId, metrics, entries: data });
});

// Aggregate metrics per day for a creator
router.get('/creators/:creatorId/daily', async (req, res) => {
  const { creatorId } = req.params;

  const { data, error } = await supabase
    .from('stream_stats')
    .select('*')
    .eq('creator_id', creatorId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const perDay: Record<
    string,
    { viewer_count: number; gift_revenue: number; subscriber_churn: number }
  > = {};

  (data as StreamStat[] | null)?.forEach((row) => {
    const day = (row.created_at || '').slice(0, 10);
    if (!perDay[day]) {
      perDay[day] = { viewer_count: 0, gift_revenue: 0, subscriber_churn: 0 };
    }
    perDay[day].viewer_count += row.viewer_count || 0;
    perDay[day].gift_revenue += row.gift_revenue || 0;
    perDay[day].subscriber_churn += row.subscriber_churn || 0;
  });

  res.json({ creatorId, perDay });
});

export default router;
