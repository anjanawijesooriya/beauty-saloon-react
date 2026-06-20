import { format } from 'date-fns'
import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'
import { Role } from '@prisma/client'
import { sendBookingConfirmation, sendCancellationEmail, sendStylistCancellationEmail } from '../../lib/mailer'
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

    // CONFIRMED bookings occupy their full duration — block any overlap
    const confirmedConflict = await prisma.appointment.findFirst({
      where: {
        stylistId: dto.stylistId,
        status: 'CONFIRMED',
        AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gt: startsAt } }],
      },
    })
    if (confirmedConflict) throw new AppError(409, 'This time slot is no longer available. Please pick another time.')

    // PENDING bookings only block the exact same start time (overlapping PENDINGs are
    // resolved automatically when the stylist confirms one of them)
    const pendingConflict = await prisma.appointment.findFirst({
      where: {
        stylistId: dto.stylistId,
        status: 'PENDING',
        startsAt,
      },
    })
    if (pendingConflict) throw new AppError(409, 'This time slot is no longer available. Please pick another time.')

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
        review: { select: { id: true } },
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
      include: {
        customer: { select: { name: true, email: true } },
        stylist:  { include: { user: { select: { id: true, name: true, email: true } } } },
        items:    { include: { service: { select: { name: true } } } },
      },
    })
    if (!appt) throw new AppError(404, 'Appointment not found')

    const isCustomer = appt.customerId === userId
    const isStylist  = appt.stylist.user.id === userId
    if (role !== 'ADMIN' && !isCustomer && !isStylist) throw new AppError(403, 'Forbidden')

    if (['CANCELLED', 'COMPLETED'].includes(appt.status))
      throw new AppError(400, `Appointment is already ${appt.status.toLowerCase()}`)

    const updated = await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED', cancelReason: reason } })

    const dateStr = format(appt.startsAt, 'PPp')
    const services = appt.items.map((i) => i.service.name)

    if (isCustomer) {
      // Customer cancelled — notify the stylist
      sendStylistCancellationEmail(appt.stylist.user.email, appt.stylist.user.name, {
        customerName: appt.customer.name,
        date: dateStr,
        services,
        reason,
      }).catch((e) => console.error('[appointments] stylist cancel email failed:', e?.message))
    } else {
      // Stylist or admin cancelled — notify the customer
      sendCancellationEmail(appt.customer.email, appt.customer.name, {
        date: dateStr,
        stylist: appt.stylist.user.name,
        reason,
        cancelledBy: isStylist ? 'stylist' : 'admin',
      }).catch((e) => console.error('[appointments] customer cancel email failed:', e?.message))
    }

    return updated
  },

  async confirm(id: string) {
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        items:    { include: { service: true } },
        customer: { select: { name: true, email: true } },
        stylist:  { include: { user: { select: { name: true } } } },
      },
    })
    if (!appt) throw new AppError(404, 'Appointment not found')
    if (appt.status !== 'PENDING') throw new AppError(400, 'Only pending appointments can be confirmed')

    const updated = await prisma.appointment.update({ where: { id }, data: { status: 'CONFIRMED' } })

    // Auto-cancel any other PENDING bookings for the same stylist that overlap this time window
    const conflicting = await prisma.appointment.findMany({
      where: {
        id:       { not: id },
        stylistId: appt.stylistId,
        status:   'PENDING',
        AND: [
          { startsAt: { lt: appt.endsAt } },
          { endsAt:   { gt: appt.startsAt } },
        ],
      },
      include: { customer: { select: { name: true, email: true } } },
    })

    const autoReason = 'Another booking was confirmed for this time slot. Please choose a different time.'
    if (conflicting.length > 0) {
      await prisma.appointment.updateMany({
        where: { id: { in: conflicting.map((c) => c.id) } },
        data: { status: 'CANCELLED', cancelReason: autoReason },
      })
      for (const c of conflicting) {
        sendCancellationEmail(c.customer.email, c.customer.name, {
          date: format(appt.startsAt, 'PPp'),
          stylist: appt.stylist.user.name,
          reason: autoReason,
          cancelledBy: 'auto',
        }).catch((e) => console.error('[appointments] auto-cancel email failed:', e?.message))
      }
    }

    sendBookingConfirmation(appt.customer.email, {
      name:     appt.customer.name,
      date:     format(appt.startsAt, 'PPp'),
      stylist:  appt.stylist.user.name,
      services: appt.items.map((i) => i.service.name),
    }).catch((e) => console.error('[appointments] confirmation email failed:', e?.message))

    return updated
  },

  async noShow(id: string) {
    const appt = await prisma.appointment.findUnique({ where: { id } })
    if (!appt) throw new AppError(404, 'Appointment not found')
    if (appt.status !== 'CONFIRMED') throw new AppError(400, 'Only confirmed appointments can be marked as no-show')
    return prisma.appointment.update({ where: { id }, data: { status: 'NO_SHOW' } })
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

  async adminList() {
    return prisma.appointment.findMany({
      include: {
        items: { include: { service: true } },
        customer: { select: { name: true, email: true } },
        stylist: { include: { user: { select: { name: true } } } },
      },
      orderBy: { startsAt: 'desc' },
    })
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
      noShow:             byStatus['NO_SHOW']   ?? 0,
      revenueLKR:         Number(revenueAgg._sum.totalLKR ?? 0),
      userCount,
      activeStylistCount,
      recent,
    }
  },
}
