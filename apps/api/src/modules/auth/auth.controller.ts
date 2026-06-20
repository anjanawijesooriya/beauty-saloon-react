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

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email)
      // Always respond 200 to avoid email enumeration
      res.json({ message: 'If that email exists, a reset link has been sent.' })
    } catch (err) { next(err) }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body.token, req.body.password)
      res.json({ message: 'Password updated successfully.' })
    } catch (err) { next(err) }
  },

  logout(_req: Request, res: Response) {
    // JWT is stateless — client drops the token.
    // Endpoint exists for future token blocklist / cookie clearing.
    res.json({ message: 'Logged out' })
  },
}
