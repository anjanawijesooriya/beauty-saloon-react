import { prisma } from '../../config/database'
import { AppError } from '../../middleware/error.middleware'

interface ListFilters {
  search?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}

interface CreateProductDto {
  name: string
  slug: string
  description?: string
  priceLKR: number
  stock: number
  imageUrls?: string[]
  categoryId: string
}

export const productsService = {
  async list(filters: ListFilters = {}) {
    const { search, categoryId, minPrice, maxPrice, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit
    const where: any = { isActive: true }
    if (search) where.name = { contains: search, mode: 'insensitive' }
    if (categoryId) where.categoryId = categoryId
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceLKR = {}
      if (minPrice !== undefined) where.priceLKR.gte = minPrice
      if (maxPrice !== undefined) where.priceLKR.lte = maxPrice
    }
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ])
    return { products: products.map((p) => ({ ...p, imageUrls: p.imageUrls ?? [] })), total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({ where: { slug } })
    if (!product) throw new AppError(404, 'Product not found')
    return { ...product, imageUrls: product.imageUrls ?? [] }
  },

  async getById(id: string) {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) throw new AppError(404, 'Product not found')
    return product
  },

  async create(dto: CreateProductDto) {
    const existing = await prisma.product.findUnique({ where: { slug: dto.slug } })
    if (existing) throw new AppError(409, 'A product with this slug already exists')
    return prisma.product.create({ data: { ...dto, imageUrls: dto.imageUrls ?? [] } })
  },

  async adminList(filters: Omit<ListFilters, 'page' | 'limit'> & { page?: number; limit?: number } = {}) {
    const { search, categoryId, minPrice, maxPrice, page = 1, limit = 50 } = filters
    const skip = (page - 1) * limit
    const where: any = {}
    if (search) where.name = { contains: search, mode: 'insensitive' }
    if (categoryId) where.categoryId = categoryId
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceLKR = {}
      if (minPrice !== undefined) where.priceLKR.gte = minPrice
      if (maxPrice !== undefined) where.priceLKR.lte = maxPrice
    }
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ])
    return { products: products.map((p) => ({ ...p, imageUrls: p.imageUrls ?? [] })), total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async update(id: string, dto: Partial<CreateProductDto>) {
    await this.getById(id)
    const { imageUrls, ...rest } = dto
    return prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(imageUrls !== undefined ? { imageUrls: { set: imageUrls } } : {}),
      },
    })
  },

  async toggleActive(id: string) {
    const product = await this.getById(id)
    return prisma.product.update({ where: { id }, data: { isActive: !product.isActive } })
  },

  async remove(id: string) {
    await this.getById(id)
    return prisma.product.delete({ where: { id } })
  },
}
