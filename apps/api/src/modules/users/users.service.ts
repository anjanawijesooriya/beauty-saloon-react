import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'

export const usersService = {
  async list(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ])
    return { users, total, page, limit }
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, isActive: true, createdAt: true },
    })
    if (!user) throw new AppError(404, 'User not found')
    return user
  },

  async update(id: string, data: { name?: string; phone?: string; avatarUrl?: string }) {
    return prisma.user.update({ where: { id }, data })
  },

  async deactivate(id: string) {
    return prisma.user.update({ where: { id }, data: { isActive: false } })
  },
}
