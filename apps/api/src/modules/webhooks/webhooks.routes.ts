import { Router, Request, Response } from 'express'
import { stripe } from '../../lib/stripe'
import { env } from '../../config/env'
import { prisma } from '../../config/database'

const router = Router()

// Raw body needed for Stripe signature verification
router.post('/stripe', async (req: Request, res: Response) => {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    // Dev mode: skip webhook processing
    return res.json({ received: true })
  }

  const sig = req.headers['stripe-signature'] as string
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return res.status(400).send('Webhook signature verification failed')
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as any
    const { appointmentId, orderId } = intent.metadata

    if (appointmentId) {
      await prisma.appointment.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      })
    }

    if (orderId) {
      await prisma.order.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: { paymentStatus: 'PAID', status: 'PROCESSING' },
      })
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as any
    const { appointmentId, orderId } = intent.metadata

    if (appointmentId) {
      await prisma.appointment.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: { paymentStatus: 'FAILED' },
      })
    }

    if (orderId) {
      await prisma.order.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: { paymentStatus: 'FAILED' },
      })
    }
  }

  res.json({ received: true })
})

export default router
