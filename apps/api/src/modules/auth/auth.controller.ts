import { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service'

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body)
      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.user.sub)
      res.json(user)
    } catch (err) {
      next(err)
    }
  },

  logout(_req: Request, res: Response) {
    // JWT is stateless — client drops the token.
    // Endpoint exists for future token blocklist / cookie clearing.
    res.json({ message: 'Logged out' })
  },
}
