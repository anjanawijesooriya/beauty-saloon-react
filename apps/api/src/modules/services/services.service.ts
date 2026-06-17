import { Prisma } from '@prisma/client'
import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'

interface ServiceFilters {
  categoryId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}

export const servicesService = {
  // ── Categories ────────────────────────────────────────────────────────────

  async listCategories() {
    return prisma.serviceCategory.findMany({ orderBy: { order: 'asc' } })
  },

  async getCategory(id: string) {
    const cat = await prisma.serviceCategory.findUnique({ where: { id } })
    if (!cat) throw new AppError(404, 'Category not found')
    return cat
  },

  async createCategory(data: { name: string; slug: string; imageUrl?: string; order?: number }) {
    const existing = await prisma.serviceCategory.findUnique({ where: { slug: data.slug } })
    if (existing) throw new AppError(409, 'Category slug already exists')
    return prisma.serviceCategory.create({ data })
  },

  async updateCategory(id: string, data: Partial<{ name: string; imageUrl: string; order: number }>) {
    await servicesService.getCategory(id)
    return prisma.serviceCategory.update({ where: { id }, data })
  },

  async deleteCategory(id: string) {
    const count = await prisma.service.count({ where: { categoryId: id } })
    if (count > 0) throw new AppError(400, 'Cannot delete a category that has services')
    await prisma.serviceCategory.delete({ where: { id } })
  },

  // ── Services ──────────────────────────────────────────────────────────────

  async list(filters: ServiceFilters = {}) {
    const { categoryId, search, minPrice, maxPrice, page = 1, limit = 12 } = filters
    const skip = (page - 1) * limit

    const where: Prisma.ServiceWhereInput = { isActive: true }
    if (categoryId) where.categoryId = categoryId
    if (search) where.name = { contains: search, mode: 'insensitive' }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePriceLKR = {}
      if (minPrice !== undefined) where.basePriceLKR = { ...where.basePriceLKR as object, gte: minPrice }
      if (maxPrice !== undefined) where.basePriceLKR = { ...where.basePriceLKR as object, lte: maxPrice }
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        include: { category: true },
        orderBy: { name: 'asc' },
      }),
      prisma.service.count({ where }),
    ])

    return { services, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async getById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        stylistServices: {
          include: {
            stylist: {
              include: { user: { select: { id: true, name: true, avatarUrl: true } } },
            },
          },
        },
      },
    })
    if (!service || !service.isActive) throw new AppError(404, 'Service not found')
    return service
  },

  async create(data: {
    categoryId: string
    name: string
    slug: string
    description?: string
    durationMins: number
    basePriceLKR: number
    imageUrl?: string
  }) {
    const slugExists = await prisma.service.findUnique({ where: { slug: data.slug } })
    if (slugExists) throw new AppError(409, 'Service slug already exists')
    return prisma.service.create({ data, include: { category: true } })
  },

  async update(
    id: string,
    data: Partial<{
      name: string
      description: string
      durationMins: number
      basePriceLKR: number
      imageUrl: string
      isActive: boolean
      categoryId: string
    }>
  ) {
    const service = await prisma.service.findUnique({ where: { id } })
    if (!service) throw new AppError(404, 'Service not found')
    return prisma.service.update({ where: { id }, data, include: { category: true } })
  },

  async softDelete(id: string) {
    const service = await prisma.service.findUnique({ where: { id } })
    if (!service) throw new AppError(404, 'Service not found')
    return prisma.service.update({ where: { id }, data: { isActive: false } })
  },
}
