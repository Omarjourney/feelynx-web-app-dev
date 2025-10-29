import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../db/supabase';
import { subscriptionSchemas, type InferBody, withValidation } from '../utils/validation';

const router = Router();
const stripeSecret = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' as any });

router.post(
  '/checkout',
  withValidation(subscriptionSchemas.checkout),
  async (req: Request, res: Response) => {
    const { priceId, successUrl, cancelUrl, userId, tierId } = req.body as InferBody<
      typeof subscriptionSchemas.checkout
    >;
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
      res.status(500).json({ error: (err as Error).message });
    }
  },
);

// Unverified JSON webhook (kept for backward compatibility in previews)
router.post(
  '/webhook',
  withValidation(subscriptionSchemas.webhook),
  async (req: Request, res: Response) => {
    const event = req.body as InferBody<typeof subscriptionSchemas.webhook>;
    if (event.type === 'checkout.session.completed') {
      const session = (event as any).data.object as Stripe.Checkout.Session;
      const tierId = session?.metadata?.tier_id as string | undefined;
      const userId = session?.metadata?.user_id as string | undefined;
      if (tierId && userId) {
        await supabase.from('fan_subscriptions').upsert(
          {
            tier_id: tierId,
            user_id: userId,
            status: 'active',
            renews_at: new Date(((session as any).expires_at || 0) * 1000).toISOString(),
          },
          { onConflict: 'tier_id,user_id' },
        );
      }
    }
    res.json({ received: true });
  },
);

// Secure Stripe webhook handler (expects express.raw at mount site)
export const webhookHandler = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    const event = stripe.webhooks.constructEvent((req as any).body, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = (event as any).data.object as Stripe.Checkout.Session;
      const tierId = session.metadata?.tier_id as string | undefined;
      const userId = session.metadata?.user_id as string | undefined;
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
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }
};

router.post(
  '/cancel',
  withValidation(subscriptionSchemas.cancel),
  async (req: Request, res: Response) => {
    const { tierId, userId } = req.body as InferBody<typeof subscriptionSchemas.cancel>;
    const query = supabase
      .from('fan_subscriptions')
      .update({ status: 'canceled' })
      .eq('tier_id', tierId);
    if (userId) query.eq('user_id', userId);
    await query;
    res.json({ ok: true });
  },
);

export default router;
