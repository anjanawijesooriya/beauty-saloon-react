import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'

interface ServiceFilters {
  categoryId?: string
  search?: string
  page?: number
  limit?: number
}

export const servicesService = {
  async listCategories() {
    return prisma.serviceCategory.findMany({ orderBy: { order: 'asc' } })
  },

  async list(filters: ServiceFilters = {}) {
    const { categoryId, search, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where: any = { isActive: true }
    if (categoryId) where.categoryId = categoryId
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const [services, total] = await Promise.all([
      prisma.service.findMany({ where, skip, take: limit, include: { category: true }, orderBy: { name: 'asc' } }),
      prisma.service.count({ where }),
    ])
    return { services, total, page, limit }
  },

  async getById(id: string) {
    const service = await prisma.service.findUnique({ where: { id }, include: { category: true } })
    if (!service) throw new AppError(404, 'Service not found')
    return service
  },

  async create(data: { categoryId: string; name: string; slug: string; description?: string; durationMins: number; basePriceLKR: number; imageUrl?: string }) {
    return prisma.service.create({ data, include: { category: true } })
  },

  async update(id: string, data: Partial<{ name: string; description: string; durationMins: number; basePriceLKR: number; imageUrl: string; isActive: boolean }>) {
    return prisma.service.update({ where: { id }, data, include: { category: true } })
  },

  async softDelete(id: string) {
    return prisma.service.update({ where: { id }, data: { isActive: false } })
  },
}
