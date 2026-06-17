import { Request, Response, NextFunction } from 'express'
import { servicesService } from './services.service'

export const servicesController = {
  async listCategories(req: Request, res: Response, next: NextFunction) {
    try { res.json(await servicesService.listCategories()) } catch (err) { next(err) }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, search, page, limit } = req.query as any
      res.json(await servicesService.list({ categoryId, search, page: Number(page), limit: Number(limit) }))
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
