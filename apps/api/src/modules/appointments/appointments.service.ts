import { format } from 'date-fns'
import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'
import { Role } from '@prisma/client'
import { sendBookingConfirmation, sendCancellationEmail } from '../../lib/mailer'
import { loyaltyService } from '../loyalty/loyalty.service'

interface CreateAppointmentDto {
  stylistId: string
  serviceIds: string[]
  startsAt: string
  notes?: string
}

export const appointmentsService = {
  async create(customerId: string, dto: CreateAppointmentDto) {
    const stylist = await prisma.stylistProfile.findUnique({ where: { id: dto.stylistId } })
    if (!stylist) throw new AppError(404, 'Stylist not found')
    if (!stylist.isAvailable) throw new AppError(400, 'Stylist is currently unavailable')

    const stylistServices = await prisma.stylistService.findMany({
      where: { stylistId: dto.stylistId, serviceId: { in: dto.serviceIds } },
      include: { service: true },
    })
    if (stylistServices.length !== dto.serviceIds.length)
      throw new AppError(400, 'One or more services are not offered by this stylist')

    const totalMins = stylistServices.reduce((acc, ss) => acc + ss.service.durationMins, 0)
    const totalLKR  = stylistServices.reduce((acc, ss) => acc + Number(ss.priceLKR), 0)
    const startsAt  = new Date(dto.startsAt)
    const endsAt    = new Date(startsAt.getTime() + totalMins * 60_000)

    // Conflict guard — prevent double-booking
    const conflict = await prisma.appointment.findFirst({
      where: {
        stylistId: dto.stylistId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gt: startsAt } }],
      },
    })
    if (conflict) throw new AppError(409, 'This time slot is no longer available. Please pick another time.')

    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        stylistId: dto.stylistId,
        startsAt,
        endsAt,
        totalLKR,
        notes: dto.notes,
        items: {
          create: stylistServices.map((ss) => ({
            serviceId: ss.serviceId,
            priceLKR: ss.priceLKR,
            durationMins: ss.service.durationMins,
          })),
        },
      },
      include: {
        items: { include: { service: true } },
        customer: { select: { name: true, email: true } },
        stylist: { include: { user: { select: { name: true } } } },
      },
    })

    // Fire-and-forget: send booking confirmation email
    sendBookingConfirmation(appointment.customer.email, {
      name:     appointment.customer.name,
      date:     format(startsAt, 'PPp'),
      stylist:  appointment.stylist.user.name,
      services: appointment.items.map((i) => i.service.name),
    }).catch(() => {})

    return appointment
  },

  async list(userId: string, role: Role) {
    const where: any = {}
    if (role === 'CUSTOMER') where.customerId = userId
    else if (role === 'STYLIST') {
      const profile = await prisma.stylistProfile.findUnique({ where: { userId } })
      if (profile) where.stylistId = profile.id
    }
    return prisma.appointment.findMany({
      where,
      include: {
        items: { include: { service: true } },
        customer: { select: { name: true, email: true } },
        stylist: { include: { user: { select: { name: true } } } },
      },
      orderBy: { startsAt: 'desc' },
    })
  },

  async getById(id: string) {
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        items: { include: { service: true } },
        customer: { select: { name: true, email: true } },
        stylist: { include: { user: { select: { name: true } } } },
      },
    })
    if (!appt) throw new AppError(404, 'Appointment not found')
    return appt
  },

  async cancel(id: string, userId: string, reason?: string, role?: Role) {
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: { customer: { select: { name: true, email: true } } },
    })
    if (!appt) throw new AppError(404, 'Appointment not found')
    if (role !== 'ADMIN' && appt.customerId !== userId) throw new AppError(403, 'Forbidden')
    if (['CANCELLED', 'COMPLETED'].includes(appt.status))
      throw new AppError(400, `Appointment is already ${appt.status.toLowerCase()}`)
    const updated = await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED', cancelReason: reason } })
    sendCancellationEmail(appt.customer.email, appt.customer.name).catch(() => {})
    return updated
  },

  async confirm(id: string) {
    const appt = await prisma.appointment.findUnique({ where: { id } })
    if (!appt) throw new AppError(404, 'Appointment not found')
    if (appt.status !== 'PENDING') throw new AppError(400, 'Only pending appointments can be confirmed')
    return prisma.appointment.update({ where: { id }, data: { status: 'CONFIRMED' } })
  },

  async complete(id: string) {
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: { customer: { select: { referralCode: true, referredBy: true } } },
    })
    if (!appt) throw new AppError(404, 'Appointment not found')
    if (appt.status !== 'CONFIRMED') throw new AppError(400, 'Only confirmed appointments can be completed')

    const updated = await prisma.appointment.update({ where: { id }, data: { status: 'COMPLETED' } })

    // Award 1 point per LKR spent
    const points = Math.floor(Number(appt.totalLKR))
    loyaltyService.award(appt.customerId, points, `Earned from appointment #${id.slice(0, 8)}`).catch(() => {})

    // Referral: first completed booking — award referrer 1000 points
    if (appt.customer.referredBy) {
      const prevCompleted = await prisma.appointment.count({
        where: { customerId: appt.customerId, status: 'COMPLETED', id: { not: id } },
      })
      if (prevCompleted === 0) {
        const referrer = await prisma.user.findUnique({ where: { referralCode: appt.customer.referredBy } })
        if (referrer) {
          loyaltyService.award(referrer.id, 1000, 'Referral bonus').catch(() => {})
          loyaltyService.award(appt.customerId, 500, 'Welcome referral bonus').catch(() => {})
        }
      }
    }

    return updated
  },

  async createPaymentIntent(appointmentId: string, customerId: string) {
    const { stripe } = await import('../../lib/stripe')
    const { env } = await import('../../config/env')

    const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } })
    if (!appt) throw new AppError(404, 'Appointment not found')
    if (appt.customerId !== customerId) throw new AppError(403, 'Forbidden')
    if (appt.paymentStatus === 'PAID') throw new AppError(400, 'Appointment is already paid')

    if (!env.STRIPE_SECRET_KEY) {
      return { clientSecret: 'dev_mock_secret', appointmentId }
    }

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(appt.totalLKR) * 100),
      currency: 'lkr',
      metadata: { appointmentId, customerId },
    })

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { stripePaymentIntentId: intent.id },
    })
    return { clientSecret: intent.client_secret, appointmentId }
  },

  async adminStats() {
    const [statusCounts, revenueAgg, recent, userCount, activeStylistCount] = await Promise.all([
      prisma.appointment.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.appointment.aggregate({ where: { status: 'COMPLETED' }, _sum: { totalLKR: true } }),
      prisma.appointment.findMany({
        take: 10,
        orderBy: { startsAt: 'desc' },
        include: {
          customer: { select: { name: true, email: true } },
          stylist:  { include: { user: { select: { name: true } } } },
          items:    { include: { service: { select: { name: true } } } },
        },
      }),
      prisma.user.count(),
      prisma.stylistProfile.count({ where: { isAvailable: true } }),
    ])

    const byStatus = Object.fromEntries(statusCounts.map((r) => [r.status, r._count._all]))
    const total    = statusCounts.reduce((a, r) => a + r._count._all, 0)

    return {
      total,
      pending:            byStatus['PENDING']   ?? 0,
      confirmed:          byStatus['CONFIRMED'] ?? 0,
      cancelled:          byStatus['CANCELLED'] ?? 0,
      completed:          byStatus['COMPLETED'] ?? 0,
      revenueLKR:         Number(revenueAgg._sum.totalLKR ?? 0),
      userCount,
      activeStylistCount,
      recent,
    }
  },
}
