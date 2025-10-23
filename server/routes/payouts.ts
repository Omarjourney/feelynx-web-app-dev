import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../db/prisma.js';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  throw new Error('STRIPE_SECRET_KEY is required');
}
const stripe = new Stripe(stripeSecret, { apiVersion: '2024-04-10' });

export const router = Router();

router.post('/onboard', async (req: Request, res: Response) => {
  const { creatorId } = req.body as { creatorId: number };
  if (!creatorId) {
    return res.status(400).json({ error: 'creatorId required' });
  }

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
});

router.post('/request', async (req: Request, res: Response) => {
  const { creatorId, amount } = req.body as { creatorId: number; amount: number };
  if (!creatorId || !amount) {
    return res.status(400).json({ error: 'creatorId and amount required' });
  }

  const account = await prisma.payoutAccount.findUnique({ where: { creatorId } });
  if (!account) {
    return res.status(400).json({ error: 'No payout account' });
  }

  const payout = await prisma.payout.create({
    data: { creatorId, amount, status: 'pending' },
  });

  res.json({ id: payout.id });
});

export const webhookHandler = async (req: Request, res: Response) => {
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
  const pending = await prisma.payout.findMany({ where: { status: 'pending' } });
  for (const p of pending) {
    const account = await prisma.payoutAccount.findUnique({ where: { creatorId: p.creatorId } });
    if (!account) continue;
    try {
      await stripe.payouts.create(
        { amount: Number(p.amount) * 100, currency: 'usd' },
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
