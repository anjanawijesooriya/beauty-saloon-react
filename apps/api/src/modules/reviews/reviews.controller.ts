import { Request, Response, NextFunction } from 'express'
import { reviewsService } from './reviews.service'

export const reviewsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await reviewsService.create(req.user.sub, req.body)) } catch (err) { next(err) }
  },

  async byStylist(req: Request, res: Response, next: NextFunction) {
    try { res.json(await reviewsService.byStylist(req.params.stylistId)) } catch (err) { next(err) }
  },

  async adminList(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await reviewsService.adminList()) } catch (err) { next(err) }
  },

  async toggleHide(req: Request, res: Response, next: NextFunction) {
    try { res.json(await reviewsService.toggleHide(req.params.id)) } catch (err) { next(err) }
  },
}
