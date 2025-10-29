import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../db/prisma';
import {
  paymentSchemas,
  type PaymentIntentBody,
  type PaymentSuccessBody,
  type InferParams,
  withValidation,
} from '../utils/validation';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

const PURCHASE_LIMIT_PER_HOUR = 5;

// Create PaymentIntent for token purchases
router.post(
  '/create-intent',
  withValidation(paymentSchemas.createIntent),
  async (req: Request, res: Response) => {
    try {
      const { amount, coins, currency, userId } = req.body as PaymentIntentBody;

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentPurchases = await prisma.payment.count({
        where: { userId, createdAt: { gte: oneHourAgo } },
      });
      if (recentPurchases >= PURCHASE_LIMIT_PER_HOUR) {
        await prisma.suspiciousActivity.create({
          data: { userId, reason: 'purchase_limit_exceeded' },
        });
        return res.status(429).json({ error: 'Purchase limit exceeded. Try again later.' });
      }

      const intent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method_types: ['card'],
        metadata: { userId: String(userId) },
        payment_method_options: {
          card: { request_three_d_secure: 'automatic' },
        },
      });

      await prisma.payment.create({
        data: {
          userId,
          amount,
          coins,
          paymentIntentId: intent.id,
        },
      });

      res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

// Verify successful payment and return receipt
router.post(
  '/success',
  withValidation(paymentSchemas.success),
  async (req: Request, res: Response) => {
    try {
      const { paymentIntentId } = req.body as PaymentSuccessBody;

      const intent = (await stripe.paymentIntents.retrieve(
        paymentIntentId,
      )) as Stripe.PaymentIntent;
      if (intent.status !== 'succeeded') {
        return res.status(400).json({ error: 'Payment not completed' });
      }

      let receiptUrl = '';
      const latestChargeId = (intent as any).latest_charge as string | undefined;
      if (latestChargeId) {
        try {
          const charge = await stripe.charges.retrieve(latestChargeId);
          receiptUrl = (charge as any).receipt_url || '';
        } catch {
          // ignore if not retrievable
        }
      }
      await prisma.payment.update({
        where: { paymentIntentId },
        data: { receiptUrl },
      });

      res.json({
        success: true,
        receiptUrl,
        disputeUrl: 'https://support.stripe.com/questions/disputes',
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

// Get user's token balance
router.get(
  '/balance/:userId',
  withValidation(paymentSchemas.balance),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params as unknown as InferParams<typeof paymentSchemas.balance>;
      const payments = (await prisma.payment.findMany({
        where: { userId },
      })) as Array<{ coins: number }>;
      const balance = payments.reduce((sum: number, p) => sum + p.coins, 0);
      res.json({ balance, userId });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
);

export const webhookHandler = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const userId = intent.metadata?.userId ? Number(intent.metadata.userId) : undefined;
    await prisma.suspiciousActivity.create({
      data: { userId, reason: 'payment_failed' },
    });
  }

  res.json({ received: true });
};

export default router;
