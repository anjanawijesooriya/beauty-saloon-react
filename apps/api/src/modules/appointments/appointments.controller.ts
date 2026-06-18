import { Request, Response, NextFunction } from 'express'
import { appointmentsService } from './appointments.service'

export const appointmentsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await appointmentsService.create(req.user.sub, req.body)) } catch (err) { next(err) }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try { res.json(await appointmentsService.list(req.user.sub, req.user.role)) } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await appointmentsService.getById(req.params.id)) } catch (err) { next(err) }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try { res.json(await appointmentsService.cancel(req.params.id, req.user.sub, req.body.reason)) } catch (err) { next(err) }
  },

  async confirm(req: Request, res: Response, next: NextFunction) {
    try { res.json(await appointmentsService.confirm(req.params.id)) } catch (err) { next(err) }
  },

  async complete(req: Request, res: Response, next: NextFunction) {
    try { res.json(await appointmentsService.complete(req.params.id)) } catch (err) { next(err) }
  },

  async adminStats(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await appointmentsService.adminStats()) } catch (err) { next(err) }
  },
}
