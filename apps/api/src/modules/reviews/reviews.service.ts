import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'

interface CreateReviewDto {
  appointmentId: string
  stylistId: string
  rating: number
  comment?: string
}

export const reviewsService = {
  async create(customerId: string, dto: CreateReviewDto) {
    const appt = await prisma.appointment.findUnique({ where: { id: dto.appointmentId } })
    if (!appt) throw new AppError(404, 'Appointment not found')
    if (appt.customerId !== customerId) throw new AppError(403, 'Forbidden')
    if (appt.status !== 'COMPLETED') throw new AppError(400, 'You can only review completed appointments')

    const existing = await prisma.review.findUnique({ where: { appointmentId: dto.appointmentId } })
    if (existing) throw new AppError(409, 'You have already reviewed this appointment')

    const review = await prisma.review.create({
      data: { customerId, stylistId: dto.stylistId, appointmentId: dto.appointmentId, rating: dto.rating, comment: dto.comment },
    })

    // Recalculate stylist rating
    const agg = await prisma.review.aggregate({
      where: { stylistId: dto.stylistId, isHidden: false },
      _avg: { rating: true },
      _count: { rating: true },
    })
    await prisma.stylistProfile.update({
      where: { id: dto.stylistId },
      data:  { rating: agg._avg.rating ?? 0, reviewCount: agg._count.rating },
    })

    return review
  },

  async byStylist(stylistId: string) {
    return prisma.review.findMany({
      where: { stylistId, isHidden: false },
      include: { customer: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    })
  },

  async adminList() {
    return prisma.review.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        appointment: {
          select: {
            startsAt: true,
            stylist: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async myReviews(userId: string) {
    const profile = await prisma.stylistProfile.findUnique({ where: { userId } })
    if (!profile) throw new AppError(404, 'Stylist profile not found')
    return prisma.review.findMany({
      where: { stylistId: profile.id },
      include: { customer: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    })
  },

  async stylistToggleHide(id: string, userId: string) {
    const profile = await prisma.stylistProfile.findUnique({ where: { userId } })
    if (!profile) throw new AppError(404, 'Stylist profile not found')
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw new AppError(404, 'Review not found')
    if (review.stylistId !== profile.id) throw new AppError(403, 'Forbidden')

    const updated = await prisma.review.update({ where: { id }, data: { isHidden: !review.isHidden } })

    const agg = await prisma.review.aggregate({
      where: { stylistId: profile.id, isHidden: false },
      _avg: { rating: true }, _count: { rating: true },
    })
    await prisma.stylistProfile.update({
      where: { id: profile.id },
      data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count.rating },
    })

    return updated
  },

  async stylistDelete(id: string, userId: string) {
    const profile = await prisma.stylistProfile.findUnique({ where: { userId } })
    if (!profile) throw new AppError(404, 'Stylist profile not found')
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw new AppError(404, 'Review not found')
    if (review.stylistId !== profile.id) throw new AppError(403, 'Forbidden')

    await prisma.review.delete({ where: { id } })

    const agg = await prisma.review.aggregate({
      where: { stylistId: profile.id, isHidden: false },
      _avg: { rating: true }, _count: { rating: true },
    })
    await prisma.stylistProfile.update({
      where: { id: profile.id },
      data: { rating: agg._avg.rating ?? 0, reviewCount: agg._count.rating },
    })
  },

  async toggleHide(id: string) {
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw new AppError(404, 'Review not found')
    const updated = await prisma.review.update({ where: { id }, data: { isHidden: !review.isHidden } })

    // Recalculate stylist rating after visibility change
    const agg = await prisma.review.aggregate({
      where: { stylistId: review.stylistId, isHidden: false },
      _avg: { rating: true },
      _count: { rating: true },
    })
    await prisma.stylistProfile.update({
      where: { id: review.stylistId },
      data:  { rating: agg._avg.rating ?? 0, reviewCount: agg._count.rating },
    })

    return updated
  },
}
