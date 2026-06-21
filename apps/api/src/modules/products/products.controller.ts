import { Request, Response, NextFunction } from 'express'
import { productsService } from './products.service'

export const productsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, categoryId, minPrice, maxPrice, page, limit } = req.query
      res.json(await productsService.list({
        search: search as string,
        categoryId: categoryId as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      }))
    } catch (err) { next(err) }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try { res.json(await productsService.getBySlug(req.params.slug)) } catch (err) { next(err) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await productsService.create(req.body)) } catch (err) { next(err) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await productsService.update(req.params.id, req.body)) } catch (err) { next(err) }
  },

  async adminList(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, categoryId, minPrice, maxPrice, page, limit } = req.query
      res.json(await productsService.adminList({
        search: search as string,
        categoryId: categoryId as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      }))
    } catch (err) { next(err) }
  },

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try { res.json(await productsService.toggleActive(req.params.id)) } catch (err) { next(err) }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try { res.json(await productsService.remove(req.params.id)) } catch (err) { next(err) }
  },
}
