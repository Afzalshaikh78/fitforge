import { Router } from 'express';
import Stripe from 'stripe';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

// Create checkout session
router.post('/create-checkout', authenticate, async (req, res) => {
  try {
    const stripe = getStripe();
    let customerId = req.user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        metadata: { userId: req.user.id },
      });
      customerId = customer.id;
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, req.user.id));
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID_PRO,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: { userId: req.user.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer portal
router.post('/portal', authenticate, async (req, res) => {
  try {
    const stripe = getStripe();
    if (!req.user.stripeCustomerId) return res.status(400).json({ error: 'No subscription found' });

    const session = await stripe.billingPortal.sessions.create({
      customer: req.user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook
router.post('/webhook', async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).send('Webhook signature failed');
  }

  const session = event.data.object;

  switch (event.type) {
    case 'checkout.session.completed': {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const userId = session.metadata.userId;
      await db.update(users).set({
        plan: 'pro',
        stripeSubscriptionId: session.subscription,
        subscriptionStatus: 'active',
      }).where(eq(users.id, userId));
      break;
    }
    case 'customer.subscription.updated': {
      const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, session.customer));
      if (user) {
        await db.update(users).set({
          plan: session.status === 'active' ? 'pro' : 'free',
          subscriptionStatus: session.status,
        }).where(eq(users.id, user.id));
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, session.customer));
      if (user) {
        await db.update(users).set({ plan: 'free', subscriptionStatus: 'canceled' }).where(eq(users.id, user.id));
      }
      break;
    }
  }

  res.json({ received: true });
});

export default router;
