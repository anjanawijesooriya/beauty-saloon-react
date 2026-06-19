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

  async myReviews(req: Request, res: Response, next: NextFunction) {
    try { res.json(await reviewsService.myReviews(req.user.sub)) } catch (err) { next(err) }
  },

  async stylistToggleHide(req: Request, res: Response, next: NextFunction) {
    try { res.json(await reviewsService.stylistToggleHide(req.params.id, req.user.sub)) } catch (err) { next(err) }
  },

  async stylistDelete(req: Request, res: Response, next: NextFunction) {
    try { await reviewsService.stylistDelete(req.params.id, req.user.sub); res.status(204).send() } catch (err) { next(err) }
  },

  async toggleHide(req: Request, res: Response, next: NextFunction) {
    try { res.json(await reviewsService.toggleHide(req.params.id)) } catch (err) { next(err) }
  },
}
