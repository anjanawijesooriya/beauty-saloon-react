import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'

interface StylistFilters {
  specialty?: string
  search?: string
  page?: number
  limit?: number
}

export const stylistsService = {
  async list(filters: StylistFilters = {}) {
    const { specialty, search, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where: any = { isAvailable: true }
    if (specialty) where.specialities = { has: specialty }
    if (search) where.user = { name: { contains: search, mode: 'insensitive' } }

    const [stylists, total] = await Promise.all([
      prisma.stylistProfile.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } }, services: { include: { service: true } } },
        orderBy: { rating: 'desc' },
      }),
      prisma.stylistProfile.count({ where }),
    ])
    return { stylists, total, page, limit }
  },

  async getById(id: string) {
    const stylist = await prisma.stylistProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, phone: true } },
        services: { include: { service: { include: { category: true } } } },
        availabilities: true,
      },
    })
    if (!stylist) throw new AppError(404, 'Stylist not found')
    return stylist
  },

  async getAvailability(stylistId: string) {
    return prisma.availability.findMany({ where: { stylistId, isActive: true } })
  },

  async updateProfile(userId: string, data: Partial<{ bio: string; specialities: string[]; experience: number; portfolioUrls: string[]; isAvailable: boolean }>) {
    const profile = await prisma.stylistProfile.findUnique({ where: { userId } })
    if (!profile) throw new AppError(404, 'Stylist profile not found')
    return prisma.stylistProfile.update({ where: { userId }, data })
  },

  async setAvailability(stylistId: string, slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>) {
    await prisma.availability.deleteMany({ where: { stylistId } })
    return prisma.availability.createMany({ data: slots.map(s => ({ ...s, stylistId })) })
  },
}
