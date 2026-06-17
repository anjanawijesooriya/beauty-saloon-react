import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { Role } from '@prisma/client'

export interface JwtPayload {
  sub: string
  email: string
  role: Role
  iat: number
  exp: number
}

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export const authorize = (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' })
  next()
}
