import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'
import { stripe } from '../../lib/stripe'
import { env } from '../../config/env'

interface CartItem {
  productId: string
  quantity: number
}

interface CreateOrderDto {
  items: CartItem[]
  promoCode?: string
  shippingAddress: {
    fullName: string
    addressLine1: string
    addressLine2?: string
    city: string
    phone: string
  }
}

export const ordersService = {
  async create(customerId: string, dto: CreateOrderDto) {
    const productIds = dto.items.map((i) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    })

    if (products.length !== productIds.length)
      throw new AppError(400, 'One or more products are unavailable')

    // Stock check
    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId)!
      if (product.stock < item.quantity)
        throw new AppError(400, `Insufficient stock for "${product.name}"`)
    }

    const subtotal = dto.items.reduce((sum, item) => {
      const p = products.find((p) => p.id === item.productId)!
      return sum + Number(p.priceLKR) * item.quantity
    }, 0)

    // Apply promo code if provided
    let totalLKR = subtotal
    if (dto.promoCode) {
      const promo = await prisma.promotion.findUnique({ where: { code: dto.promoCode.toUpperCase() } })
      if (promo && promo.isActive) {
        const discount =
          promo.type === 'PERCENT'
            ? Math.round((subtotal * Number(promo.value)) / 100)
            : Math.min(Number(promo.value), subtotal)
        totalLKR = subtotal - discount
        await prisma.promotion.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } })
      }
    }

    const order = await prisma.order.create({
      data: {
        customerId,
        totalLKR,
        shippingAddress: dto.shippingAddress as any,
        items: {
          create: dto.items.map((item) => {
            const p = products.find((p) => p.id === item.productId)!
            return { productId: item.productId, quantity: item.quantity, priceLKR: p.priceLKR }
          }),
        },
      },
      include: { items: { include: { product: true } } },
    })

    // Deduct stock
    for (const item of dto.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return order
  },

  async list(customerId: string) {
    return prisma.order.findMany({
      where: { customerId },
      include: { items: { include: { product: { select: { name: true, imageUrls: true } } } } },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getById(id: string, customerId?: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, customer: { select: { name: true, email: true } } },
    })
    if (!order) throw new AppError(404, 'Order not found')
    if (customerId && order.customerId !== customerId) throw new AppError(403, 'Forbidden')
    return order
  },

  async adminList() {
    return prisma.order.findMany({
      include: {
        items: { include: { product: { select: { name: true } } } },
        customer: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async adminUpdateStatus(id: string, status: string) {
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) throw new AppError(404, 'Order not found')
    return prisma.order.update({ where: { id }, data: { status: status as any } })
  },

  async createPaymentIntent(orderId: string, customerId: string) {
    const order = await this.getById(orderId, customerId)
    if (order.paymentStatus === 'PAID') throw new AppError(400, 'Order is already paid')

    if (!env.STRIPE_SECRET_KEY) {
      // Dev mode: return mock client secret
      return { clientSecret: 'dev_mock_secret', orderId }
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalLKR) * 100),
      currency: 'lkr',
      metadata: { orderId, customerId },
    })

    await prisma.order.update({ where: { id: orderId }, data: { stripePaymentIntentId: intent.id } })
    return { clientSecret: intent.client_secret, orderId }
  },
}
