import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../db/prisma.js';
import { payoutSchemas, type InferBody, withValidation } from '../utils/validation';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export const router = Router();

router.post(
  '/onboard',
  withValidation(payoutSchemas.onboard),
  async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }
    const { creatorId } = req.body as InferBody<typeof payoutSchemas.onboard>;

    let account = await prisma.payoutAccount.findUnique({ where: { creatorId } });
    if (!account) {
      const stripeAccount = await stripe.accounts.create({ type: 'express' });
      account = await prisma.payoutAccount.create({
        data: {
          creatorId,
          stripeAccountId: stripeAccount.id,
          status: stripeAccount.details_submitted ? 'verified' : 'pending',
        },
      });
    }

    const origin = process.env.BASE_URL || 'http://localhost:3000';
    const accountLink = await stripe.accountLinks.create({
      account: account.stripeAccountId,
      refresh_url: `${origin}/payouts/refresh`,
      return_url: `${origin}/payouts/complete`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  },
);

router.post(
  '/request',
  withValidation(payoutSchemas.request),
  async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }
    const { creatorId, amount } = req.body as InferBody<typeof payoutSchemas.request>;

    const account = await prisma.payoutAccount.findUnique({ where: { creatorId } });
    if (!account) {
      return res.status(400).json({ error: 'No payout account' });
    }

    const payout = await prisma.payout.create({
      data: { creatorId, amount, status: 'pending' },
    });

    res.json({ id: payout.id });
  },
);

export const webhookHandler = async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;
  try {
    if (!webhookSecret || !sig) {
      throw new Error('Missing signature');
    }
    event = stripe.webhooks.constructEvent((req as any).body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === 'account.updated') {
    const acct = event.data.object as Stripe.Account;
    await prisma.payoutAccount.updateMany({
      where: { stripeAccountId: acct.id },
      data: { status: acct.details_submitted ? 'verified' : 'pending' },
    });
  }

  res.json({ received: true });
};

export async function processPendingPayouts() {
  if (!stripe) return;
  const pending = await prisma.payout.findMany({ where: { status: 'pending' } });
  for (const p of pending) {
    const account = await prisma.payoutAccount.findUnique({ where: { creatorId: p.creatorId } });
    if (!account) continue;
    try {
      const amountFloat = typeof p.amount === 'number' ? p.amount : Number(p.amount);
      if (!Number.isFinite(amountFloat)) {
        throw new Error('Invalid payout amount');
      }
      const amountInCents = Math.round(amountFloat * 100);
      await stripe.payouts.create(
        { amount: amountInCents, currency: 'usd' },
        { stripeAccount: account.stripeAccountId },
      );
      await prisma.payout.update({
        where: { id: p.id },
        data: { status: 'processed', processedAt: new Date() },
      });
    } catch (err) {
      console.error('Payout error', err);
    }
  }
}

export default router;
