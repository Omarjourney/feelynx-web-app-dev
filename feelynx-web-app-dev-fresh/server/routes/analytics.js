import { Router } from 'express';
import { supabase } from '../db/supabase';
import { analyticsSchemas, withValidation } from '../utils/validation';
const router = Router();
// Aggregate metrics for a single stream
router.get('/streams/:streamId', withValidation(analyticsSchemas.stream), async (req, res) => {
  var _a;
  const { streamId } = req.params;
  const { data, error } = await supabase.from('stream_stats').select('*').eq('stream_id', streamId);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  const metrics = ((_a = data) !== null && _a !== void 0 ? _a : []).reduce(
    (acc, row) => {
      acc.viewer_count += row.viewer_count || 0;
      acc.gift_revenue += row.gift_revenue || 0;
      acc.subscriber_churn += row.subscriber_churn || 0;
      return acc;
    },
    { viewer_count: 0, gift_revenue: 0, subscriber_churn: 0 },
  );
  res.json({ streamId, metrics, entries: data });
});
// Aggregate metrics per day for a creator
router.get(
  '/creators/:creatorId/daily',
  withValidation(analyticsSchemas.creatorDaily),
  async (req, res) => {
    const { creatorId } = req.params;
    const { data, error } = await supabase
      .from('stream_stats')
      .select('*')
      .eq('creator_id', creatorId);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    const perDay = {};
    data === null || data === void 0
      ? void 0
      : data.forEach((row) => {
          const day = (row.created_at || '').slice(0, 10);
          if (!perDay[day]) {
            perDay[day] = { viewer_count: 0, gift_revenue: 0, subscriber_churn: 0 };
          }
          perDay[day].viewer_count += row.viewer_count || 0;
          perDay[day].gift_revenue += row.gift_revenue || 0;
          perDay[day].subscriber_churn += row.subscriber_churn || 0;
        });
    res.json({ creatorId, perDay });
  },
);
export default router;
