import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'

interface CreatePromotionDto {
  code: string
  description?: string
  type: 'PERCENT' | 'FIXED'
  value: number
  minOrderLKR?: number
  maxUses?: number
  expiresAt?: string
}

export const promotionsService = {
  async list() {
    return prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } })
  },

  async validate(code: string, orderTotal: number) {
    const promo = await prisma.promotion.findUnique({ where: { code: code.toUpperCase() } })
    if (!promo || !promo.isActive) throw new AppError(404, 'Invalid or expired promo code')
    if (promo.expiresAt && promo.expiresAt < new Date()) throw new AppError(400, 'Promo code has expired')
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) throw new AppError(400, 'Promo code usage limit reached')
    if (promo.minOrderLKR && orderTotal < Number(promo.minOrderLKR))
      throw new AppError(400, `Minimum order of LKR ${Number(promo.minOrderLKR).toLocaleString()} required`)

    const discount =
      promo.type === 'PERCENT'
        ? Math.round((orderTotal * Number(promo.value)) / 100)
        : Math.min(Number(promo.value), orderTotal)

    return { promo, discount, finalTotal: orderTotal - discount }
  },

  async create(dto: CreatePromotionDto) {
    const existing = await prisma.promotion.findUnique({ where: { code: dto.code.toUpperCase() } })
    if (existing) throw new AppError(409, 'A promotion with this code already exists')
    return prisma.promotion.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    })
  },

  async update(id: string, dto: Partial<CreatePromotionDto> & { isActive?: boolean }) {
    return prisma.promotion.update({
      where: { id },
      data: { ...dto, expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined },
    })
  },
}
