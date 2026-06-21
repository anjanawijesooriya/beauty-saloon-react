import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'

export const loyaltyService = {
  async getBalance(userId: string) {
    const record = await prisma.loyaltyPoints.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    })
    return record ?? { balance: 0, transactions: [] }
  },

  async getTransactions(userId: string) {
    const record = await prisma.loyaltyPoints.findUnique({ where: { userId } })
    if (!record) return []
    return prisma.loyaltyTransaction.findMany({
      where: { loyaltyId: record.id },
      orderBy: { createdAt: 'desc' },
    })
  },

  async award(userId: string, points: number, reason: string) {
    const record = await prisma.loyaltyPoints.upsert({
      where:  { userId },
      update: { balance: { increment: points } },
      create: { userId, balance: points },
    })
    await prisma.loyaltyTransaction.create({
      data: { loyaltyId: record.id, points, reason },
    })
    return record
  },

  async redeem(userId: string, points: number) {
    const record = await prisma.loyaltyPoints.findUnique({ where: { userId } })
    if (!record || record.balance < points) throw new AppError(400, 'Insufficient loyalty points')
    const updated = await prisma.loyaltyPoints.update({
      where: { userId },
      data:  { balance: { decrement: points } },
    })
    await prisma.loyaltyTransaction.create({
      data: { loyaltyId: record.id, points: -points, reason: 'Points redeemed' },
    })
    const discountLKR = Math.floor(points / 100) * 10
    return { balance: updated.balance, discountLKR }
  },

  // Admin: leaderboard
  async leaderboard() {
    return prisma.loyaltyPoints.findMany({
      orderBy: { balance: 'desc' },
      take: 20,
      include: { user: { select: { name: true, email: true } } },
    })
  },
}
