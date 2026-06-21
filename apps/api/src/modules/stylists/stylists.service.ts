import { Prisma } from '@prisma/client'
import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'
import { addMinutes, format, parseISO, setHours, setMinutes, isBefore, isAfter, isEqual } from 'date-fns'

interface StylistFilters {
  specialty?: string
  search?: string
  page?: number
  limit?: number
}

export const stylistsService = {
  // ── Public listing ────────────────────────────────────────────────────────

  async list(filters: StylistFilters = {}) {
    const { specialty, search, page = 1, limit = 12 } = filters
    const skip = (page - 1) * limit

    const where: Prisma.StylistProfileWhereInput = { isAvailable: true }
    if (specialty) where.specialities = { has: specialty }
    if (search) where.user = { name: { contains: search, mode: 'insensitive' } }

    const [stylists, total] = await Promise.all([
      prisma.stylistProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          services: { include: { service: { include: { category: true } } } },
        },
        orderBy: { rating: 'desc' },
      }),
      prisma.stylistProfile.count({ where }),
    ])

    return { stylists, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async getById(id: string) {
    const stylist = await prisma.stylistProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, phone: true } },
        services: { include: { service: { include: { category: true } } } },
        availabilities: { where: { isActive: true }, orderBy: { dayOfWeek: 'asc' } },
      },
    })
    if (!stylist) throw new AppError(404, 'Stylist not found')
    return stylist
  },

  // ── Availability & slots ──────────────────────────────────────────────────

  async getAvailability(stylistId: string) {
    return prisma.availability.findMany({
      where: { stylistId, isActive: true },
      orderBy: { dayOfWeek: 'asc' },
    })
  },

  async getAvailableSlots(stylistId: string, dateStr: string, durationMins: number) {
    const date = parseISO(dateStr)
    const dayOfWeek = date.getDay()

    const availability = await prisma.availability.findFirst({
      where: { stylistId, dayOfWeek, isActive: true },
    })
    if (!availability) return []

    // Existing appointments that day
    const startOfDay = setHours(setMinutes(date, 0), 0)
    const endOfDay   = setHours(setMinutes(date, 59), 23)
    const booked = await prisma.appointment.findMany({
      where: {
        stylistId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        startsAt: { gte: startOfDay, lte: endOfDay },
      },
      select: { startsAt: true, endsAt: true, status: true },
    })

    // Generate 30-min slots within availability window
    const [startH, startM] = availability.startTime.split(':').map(Number)
    const [endH, endM]     = availability.endTime.split(':').map(Number)
    let cursor = setMinutes(setHours(date, startH), startM)
    const windowEnd = setMinutes(setHours(date, endH), endM)

    const slots: string[] = []
    while (!isAfter(addMinutes(cursor, durationMins), windowEnd)) {
      const slotEnd = addMinutes(cursor, durationMins)
      const overlaps = booked.some((b) => {
        if (b.status === 'CONFIRMED') {
          // Confirmed booking occupies its full duration — block any slot that overlaps it
          return isBefore(cursor, b.endsAt) && isAfter(slotEnd, b.startsAt)
        }
        // Pending booking only blocks its exact start time and any slot that would
        // start BEFORE it but end AFTER it starts (i.e. runs into it)
        return isEqual(cursor, b.startsAt) ||
               (isBefore(cursor, b.startsAt) && isAfter(slotEnd, b.startsAt))
      })
      if (!overlaps) slots.push(format(cursor, "HH:mm"))
      cursor = addMinutes(cursor, 30)
    }

    return slots
  },

  // ── Stylist portal (own profile) ──────────────────────────────────────────

  async getMyProfile(userId: string) {
    const profile = await prisma.stylistProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, phone: true } },
        services: { include: { service: { include: { category: true } } } },
        availabilities: { where: { isActive: true }, orderBy: { dayOfWeek: 'asc' } },
      },
    })
    if (!profile) throw new AppError(404, 'Stylist profile not found. Contact admin.')
    return profile
  },

  async updateMyProfile(
    userId: string,
    data: Partial<{ bio: string; specialities: string[]; experience: number; portfolioUrls: string[]; isAvailable: boolean }>
  ) {
    const profile = await prisma.stylistProfile.findUnique({ where: { userId } })
    if (!profile) throw new AppError(404, 'Stylist profile not found')
    return prisma.stylistProfile.update({ where: { userId }, data })
  },

  async setMyAvailability(
    userId: string,
    slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
  ) {
    const profile = await prisma.stylistProfile.findUnique({ where: { userId } })
    if (!profile) throw new AppError(404, 'Stylist profile not found')
    await prisma.availability.deleteMany({ where: { stylistId: profile.id } })
    await prisma.availability.createMany({
      data: slots.map((s) => ({ ...s, stylistId: profile.id })),
    })
    return prisma.availability.findMany({ where: { stylistId: profile.id }, orderBy: { dayOfWeek: 'asc' } })
  },

  async setMyServices(userId: string, services: Array<{ serviceId: string; priceLKR: number }>) {
    const profile = await prisma.stylistProfile.findUnique({ where: { userId } })
    if (!profile) throw new AppError(404, 'Stylist profile not found')
    await prisma.stylistService.deleteMany({ where: { stylistId: profile.id } })
    await prisma.stylistService.createMany({
      data: services.map((s) => ({ ...s, stylistId: profile.id })),
    })
    return prisma.stylistService.findMany({
      where: { stylistId: profile.id },
      include: { service: { include: { category: true } } },
    })
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  async adminList() {
    return prisma.stylistProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async createProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new AppError(404, 'User not found')
    const existing = await prisma.stylistProfile.findUnique({ where: { userId } })
    if (existing) throw new AppError(409, 'Stylist profile already exists for this user')
    // Promote user role to STYLIST
    await prisma.user.update({ where: { id: userId }, data: { role: 'STYLIST' } })
    return prisma.stylistProfile.create({
      data: { userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
  },

  async toggleAvailability(id: string) {
    const profile = await prisma.stylistProfile.findUnique({ where: { id } })
    if (!profile) throw new AppError(404, 'Stylist not found')
    return prisma.stylistProfile.update({
      where: { id },
      data: { isAvailable: !profile.isAvailable },
    })
  },

  async hardDelete(stylistProfileId: string) {
    const profile = await prisma.stylistProfile.findUnique({ where: { id: stylistProfileId } })
    if (!profile) throw new AppError(404, 'Stylist not found')
    const userId = profile.userId

    await prisma.$transaction(async (tx) => {
      // Delete all appointment data where this person was the stylist
      const stylistAppts = await tx.appointment.findMany({
        where: { stylistId: stylistProfileId },
        select: { id: true },
      })
      if (stylistAppts.length) {
        const ids = stylistAppts.map((a) => a.id)
        await tx.review.deleteMany({ where: { appointmentId: { in: ids } } })
        await tx.appointmentItem.deleteMany({ where: { appointmentId: { in: ids } } })
        await tx.appointment.deleteMany({ where: { stylistId: stylistProfileId } })
      }

      // Delete stylist profile sub-records
      await tx.availability.deleteMany({ where: { stylistId: stylistProfileId } })
      await tx.stylistService.deleteMany({ where: { stylistId: stylistProfileId } })
      await tx.stylistProfile.delete({ where: { id: stylistProfileId } })

      // Delete user-side data (loyalty, customer appointments, orders)
      const loyalty = await tx.loyaltyPoints.findUnique({ where: { userId } })
      if (loyalty) {
        await tx.loyaltyTransaction.deleteMany({ where: { loyaltyId: loyalty.id } })
        await tx.loyaltyPoints.delete({ where: { userId } })
      }
      await tx.review.deleteMany({ where: { customerId: userId } })
      const customerAppts = await tx.appointment.findMany({ where: { customerId: userId }, select: { id: true } })
      if (customerAppts.length) {
        const ids = customerAppts.map((a) => a.id)
        await tx.appointmentItem.deleteMany({ where: { appointmentId: { in: ids } } })
        await tx.appointment.deleteMany({ where: { customerId: userId } })
      }
      const orders = await tx.order.findMany({ where: { customerId: userId }, select: { id: true } })
      if (orders.length) {
        const ids = orders.map((o) => o.id)
        await tx.orderItem.deleteMany({ where: { orderId: { in: ids } } })
        await tx.order.deleteMany({ where: { customerId: userId } })
      }

      await tx.user.delete({ where: { id: userId } })
    })
  },
}
