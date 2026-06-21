import { Request, Response, NextFunction } from 'express'
import { servicesService } from './services.service'

export const servicesController = {
  // ── Categories ────────────────────────────────────────────────────────────

  async listCategories(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await servicesService.listCategories()) } catch (err) { next(err) }
  },

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await servicesService.createCategory(req.body)) } catch (err) { next(err) }
  },

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try { res.json(await servicesService.updateCategory(req.params.id, req.body)) } catch (err) { next(err) }
  },

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try { await servicesService.deleteCategory(req.params.id); res.status(204).send() } catch (err) { next(err) }
  },

  // ── Services ──────────────────────────────────────────────────────────────

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, search, minPrice, maxPrice, page, limit } = req.query as Record<string, string>
      res.json(
        await servicesService.list({
          categoryId,
          search,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 12,
        })
      )
    } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await servicesService.getById(req.params.id)) } catch (err) { next(err) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await servicesService.create(req.body)) } catch (err) { next(err) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await servicesService.update(req.params.id, req.body)) } catch (err) { next(err) }
  },

  async softDelete(req: Request, res: Response, next: NextFunction) {
    try { await servicesService.softDelete(req.params.id); res.status(204).send() } catch (err) { next(err) }
  },
}
