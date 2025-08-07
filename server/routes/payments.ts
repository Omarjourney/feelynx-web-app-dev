import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../db/prisma';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20'
});

const PURCHASE_LIMIT_PER_HOUR = 5;

// Create PaymentIntent for token purchases
router.post('/create-intent', async (req: Request, res: Response) => {
  try {
    const { amount, coins, currency = 'usd', userId } = req.body;

    const amountNum = Number(amount);
    const coinsNum = Number(coins);
    const userIdNum = userId ? Number(userId) : undefined;

    if ([amountNum, coinsNum].some((n) => Number.isNaN(n) || n <= 0) || !userIdNum) {
      return res
        .status(400)
        .json({ error: 'Invalid amount, coins, or userId.' });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentPurchases = await prisma.payment.count({
      where: { userId: userIdNum, createdAt: { gte: oneHourAgo } }
    });
    if (recentPurchases >= PURCHASE_LIMIT_PER_HOUR) {
      await prisma.suspiciousActivity.create({
        data: { userId: userIdNum, reason: 'purchase_limit_exceeded' }
      });
      return res
        .status(429)
        .json({ error: 'Purchase limit exceeded. Try again later.' });
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amountNum * 100),
      currency,
      payment_method_types: ['card'],
      metadata: { userId: String(userIdNum) },
      payment_method_options: {
        card: { request_three_d_secure: 'automatic' }
      }
    });

    await prisma.payment.create({
      data: {
        userId: userIdNum,
        amount: amountNum,
        coins: coinsNum,
        paymentIntentId: intent.id
      }
    });

    res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Verify successful payment and return receipt
router.post('/success', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body as { paymentIntentId: string };

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const receiptUrl = intent.charges?.data[0]?.receipt_url || '';
    await prisma.payment.update({
      where: { paymentIntentId },
      data: { receiptUrl }
    });

    res.json({
      success: true,
      receiptUrl,
      disputeUrl: 'https://support.stripe.com/questions/disputes'
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get user's token balance
router.get('/balance/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const payments = await prisma.payment.findMany({
      where: { userId: Number(userId) }
    });
    const balance = payments.reduce((sum, p) => sum + p.coins, 0);
    res.json({ balance, userId });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

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
    const userId = intent.metadata?.userId
      ? Number(intent.metadata.userId)
      : undefined;
    await prisma.suspiciousActivity.create({
      data: { userId, reason: 'payment_failed' }
    });
  }

  res.json({ received: true });
};

export default router;
