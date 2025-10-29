import { Router } from 'express';
import Stripe from 'stripe';
import { supabase } from '../db/supabase';
import { subscriptionSchemas, withValidation } from '../utils/validation';
const router = Router();
const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });
router.post('/checkout', withValidation(subscriptionSchemas.checkout), async (req, res) => {
  const { priceId, successUrl, cancelUrl, userId, tierId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { user_id: userId, tier_id: tierId },
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Unverified JSON webhook (kept for backward compatibility in previews)
router.post('/webhook', withValidation(subscriptionSchemas.webhook), async (req, res) => {
  var _a, _b;
  const event = req.body;
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const tierId =
      (_a = session === null || session === void 0 ? void 0 : session.metadata) === null ||
      _a === void 0
        ? void 0
        : _a.tier_id;
    const userId =
      (_b = session === null || session === void 0 ? void 0 : session.metadata) === null ||
      _b === void 0
        ? void 0
        : _b.user_id;
    if (tierId && userId) {
      await supabase.from('fan_subscriptions').upsert(
        {
          tier_id: tierId,
          user_id: userId,
          status: 'active',
          renews_at: new Date((session.expires_at || 0) * 1000).toISOString(),
        },
        { onConflict: 'tier_id,user_id' },
      );
    }
  }
  res.json({ received: true });
});
// Secure Stripe webhook handler (expects express.raw at mount site)
export const webhookHandler = async (req, res) => {
  var _a, _b;
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const tierId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.tier_id;
      const userId = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.user_id;
      if (tierId && userId) {
        await supabase.from('fan_subscriptions').upsert(
          {
            tier_id: tierId,
            user_id: userId,
            status: 'active',
            renews_at: new Date((session.expires_at || 0) * 1000).toISOString(),
          },
          { onConflict: 'tier_id,user_id' },
        );
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Subscriptions webhook verification failed', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
router.post('/cancel', withValidation(subscriptionSchemas.cancel), async (req, res) => {
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
