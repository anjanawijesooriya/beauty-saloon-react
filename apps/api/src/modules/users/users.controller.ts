import { Request, Response, NextFunction } from 'express'
import { usersService } from './users.service'

export const usersController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 20
      const role = req.query.role as string | undefined
      res.json(await usersService.list(page, limit, role))
    } catch (err) { next(err) }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await usersService.getById(req.params.id))
    } catch (err) { next(err) }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await usersService.update(req.user.sub, req.body))
    } catch (err) { next(err) }
  },

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await usersService.toggleStatus(req.params.id))
    } catch (err) { next(err) }
  },

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.deactivate(req.params.id)
      res.status(204).send()
    } catch (err) { next(err) }
  },

  async hardDelete(req: Request, res: Response, next: NextFunction) {
    try {
      await usersService.hardDelete(req.params.id)
      res.status(204).send()
    } catch (err) { next(err) }
  },
}
