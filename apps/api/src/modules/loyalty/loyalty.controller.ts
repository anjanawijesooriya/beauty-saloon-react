import { Request, Response, NextFunction } from 'express'
import { loyaltyService } from './loyalty.service'

export const loyaltyController = {
  async getBalance(req: Request, res: Response, next: NextFunction) {
    try { res.json(await loyaltyService.getBalance(req.user.sub)) } catch (err) { next(err) }
  },

  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try { res.json(await loyaltyService.getTransactions(req.user.sub)) } catch (err) { next(err) }
  },

  async redeem(req: Request, res: Response, next: NextFunction) {
    try { res.json(await loyaltyService.redeem(req.user.sub, req.body.points)) } catch (err) { next(err) }
  },

  async leaderboard(_req: Request, res: Response, next: NextFunction) {
    try { res.json(await loyaltyService.leaderboard()) } catch (err) { next(err) }
  },
}
