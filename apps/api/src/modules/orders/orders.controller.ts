import { Request, Response, NextFunction } from 'express'
import { ordersService } from './orders.service'

export const ordersController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try { res.status(201).json(await ordersService.create(req.user.sub, req.body)) } catch (err) { next(err) }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try { res.json(await ordersService.list(req.user.sub)) } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await ordersService.getById(req.params.id, req.user.sub)) } catch (err) { next(err) }
  },

  async pay(req: Request, res: Response, next: NextFunction) {
    try { res.json(await ordersService.createPaymentIntent(req.params.id, req.user.sub)) } catch (err) { next(err) }
  },

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try { res.json(await ordersService.verifyPayment(req.params.id, req.user.sub, req.body.paymentIntentId)) } catch (err) { next(err) }
  },

  async simulatePaymentDev(req: Request, res: Response, next: NextFunction) {
    try { res.json(await ordersService.simulatePaymentDev(req.params.id, req.user.sub)) } catch (err) { next(err) }
  },

  async adminList(req: Request, res: Response, next: NextFunction) {
    try { res.json(await ordersService.adminList()) } catch (err) { next(err) }
  },

  async adminUpdateStatus(req: Request, res: Response, next: NextFunction) {
    try { res.json(await ordersService.adminUpdateStatus(req.params.id, req.body.status)) } catch (err) { next(err) }
  },

  async adminDelete(req: Request, res: Response, next: NextFunction) {
    try { await ordersService.adminDelete(req.params.id); res.status(204).send() } catch (err) { next(err) }
  },
}
