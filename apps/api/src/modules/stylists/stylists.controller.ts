import { Request, Response, NextFunction } from 'express'
import { stylistsService } from './stylists.service'

export const stylistsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { specialty, search, page, limit } = req.query as any
      res.json(await stylistsService.list({ specialty, search, page: Number(page), limit: Number(limit) }))
    } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try { res.json(await stylistsService.getById(req.params.id)) } catch (err) { next(err) }
  },

  async getAvailability(req: Request, res: Response, next: NextFunction) {
    try { res.json(await stylistsService.getAvailability(req.params.id)) } catch (err) { next(err) }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try { res.json(await stylistsService.updateProfile(req.user.sub, req.body)) } catch (err) { next(err) }
  },

  async setAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await import('../../config/database').then(m => m.prisma.stylistProfile.findUnique({ where: { userId: req.user.sub } }))
      if (!profile) return res.status(404).json({ message: 'Profile not found' })
      res.json(await stylistsService.setAvailability(profile.id, req.body.slots))
    } catch (err) { next(err) }
  },
}
