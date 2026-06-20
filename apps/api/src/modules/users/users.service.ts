import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'

export const usersService = {
  async list(page = 1, limit = 20, role?: string) {
    const skip = (page - 1) * limit
    const where: any = role ? { role } : {}
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
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

  async toggleStatus(id: string) {
    const user = await this.getById(id)
    return prisma.user.update({ where: { id }, data: { isActive: !user.isActive } })
  },

  async deactivate(id: string) {
    return prisma.user.update({ where: { id }, data: { isActive: false } })
  },

  async uploadAvatar(userId: string, buffer: Buffer): Promise<{ avatarUrl: string }> {
    const { uploadToCloudinary } = await import('../../lib/cloudinary')
    const url = await uploadToCloudinary(buffer, 'glowher/avatars')
    const user = await prisma.user.update({ where: { id: userId }, data: { avatarUrl: url } })
    return { avatarUrl: user.avatarUrl! }
  },

  async removeAvatar(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } })
    if (user?.avatarUrl) {
      const { deleteFromCloudinary } = await import('../../lib/cloudinary')
      await deleteFromCloudinary(user.avatarUrl).catch(() => {})
    }
    await prisma.user.update({ where: { id: userId }, data: { avatarUrl: null } })
  },

  async hardDelete(id: string) {
    await this.getById(id)
    await prisma.$transaction(async (tx) => {
      const loyalty = await tx.loyaltyPoints.findUnique({ where: { userId: id } })
      if (loyalty) {
        await tx.loyaltyTransaction.deleteMany({ where: { loyaltyId: loyalty.id } })
        await tx.loyaltyPoints.delete({ where: { userId: id } })
      }
      await tx.review.deleteMany({ where: { customerId: id } })
      const appts = await tx.appointment.findMany({ where: { customerId: id }, select: { id: true } })
      if (appts.length) {
        const ids = appts.map((a) => a.id)
        await tx.appointmentItem.deleteMany({ where: { appointmentId: { in: ids } } })
        await tx.appointment.deleteMany({ where: { customerId: id } })
      }
      const orders = await tx.order.findMany({ where: { customerId: id }, select: { id: true } })
      if (orders.length) {
        const ids = orders.map((o) => o.id)
        await tx.orderItem.deleteMany({ where: { orderId: { in: ids } } })
        await tx.order.deleteMany({ where: { customerId: id } })
      }
      await tx.user.delete({ where: { id } })
    })
  },
}
