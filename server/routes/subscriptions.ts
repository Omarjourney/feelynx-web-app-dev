import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' as any });

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const { priceId, successUrl, cancelUrl, userId, tierId } = req.body;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { user_id: userId, tier_id: tierId }
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  const event = req.body;
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const tierId = session.metadata?.tier_id as string | undefined;
    const userId = session.metadata?.user_id as string | undefined;
    if (tierId && userId) {
      await supabase.from('fan_subscriptions').upsert({
        tier_id: tierId,
        user_id: userId,
        status: 'active',
        renews_at: new Date((session.expires_at || 0) * 1000).toISOString()
      }, { onConflict: 'tier_id,user_id' });
    }
  }
  res.json({ received: true });
});

router.post('/cancel', async (req: Request, res: Response) => {
  const { tierId, userId } = req.body;
  const query = supabase
    .from('fan_subscriptions')
    .update({ status: 'canceled' })
    .eq('tier_id', tierId);
  if (userId) query.eq('user_id', userId);
  await query;
  res.json({ ok: true });
});

export default router;
