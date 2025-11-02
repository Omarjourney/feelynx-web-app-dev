import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../db/prisma';
import { paymentSchemas, withValidation } from '../utils/validation';
const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const PURCHASE_LIMIT_PER_HOUR = 5;
// Create PaymentIntent for token purchases
router.post('/create-intent', withValidation(paymentSchemas.createIntent), async (req, res) => {
  try {
    const { amount, coins, currency, userId } = req.body;
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
    res.status(500).json({ error: error.message });
  }
});
// Verify successful payment and return receipt
router.post('/success', withValidation(paymentSchemas.success), async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    let receiptUrl = '';
    const latestChargeId = intent.latest_charge;
    if (latestChargeId) {
      try {
        const charge = await stripe.charges.retrieve(latestChargeId);
        receiptUrl = charge.receipt_url || '';
      } catch (_a) {
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
    res.status(500).json({ error: error.message });
  }
});
// Get user's token balance
router.get('/balance/:userId', withValidation(paymentSchemas.balance), async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await prisma.payment.findMany({
      where: { userId },
    });
    const balance = payments.reduce((sum, p) => sum + p.coins, 0);
    res.json({ balance, userId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export const webhookHandler = async (req, res) => {
  var _a;
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    const userId = ((_a = intent.metadata) === null || _a === void 0 ? void 0 : _a.userId)
      ? Number(intent.metadata.userId)
      : undefined;
    await prisma.suspiciousActivity.create({
      data: { userId, reason: 'payment_failed' },
    });
  }
  res.json({ received: true });
};
export default router;
