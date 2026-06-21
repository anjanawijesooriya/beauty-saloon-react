import { Request, Response, NextFunction } from 'express'
import { promotionsService } from './promotions.service'

export const promotionsController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await promotionsService.list()) } catch (err) { next(err) }
  },

  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, orderTotal } = req.query
      res.json(await promotionsService.validate(code as string, Number(orderTotal)))
    } catch (err) { next(err) }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await promotionsService.create(req.body)) } catch (err) { next(err) }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try { res.json(await promotionsService.update(req.params.id, req.body)) } catch (err) { next(err) }
  },
}
