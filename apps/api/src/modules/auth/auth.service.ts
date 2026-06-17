import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/database'
import { env } from '../../config/env'
import { AppError } from '../../middleware/error.middleware'
import { sendWelcomeEmail } from '../../lib/mailer'

interface RegisterDto {
  name: string
  email: string
  password: string
  phone?: string
}

interface LoginDto {
  email: string
  password: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
}

function signToken(payload: { sub: string; email: string; role: string }) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions)
}

export const authService = {
  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new AppError(409, 'Email already registered')

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        phone: dto.phone ?? null,
      },
    })

    // Fire-and-forget — don't fail registration if email is misconfigured
    sendWelcomeEmail(user.email, user.name).catch((e) =>
      console.warn('[mailer] welcome email failed:', e.message)
    )

    const token = signToken({ sub: user.id, email: user.email, role: user.role })
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
      },
    }
  },

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } })
    if (!user || !user.passwordHash) throw new AppError(401, 'Invalid email or password')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new AppError(401, 'Invalid email or password')

    if (!user.isActive) throw new AppError(403, 'Account has been deactivated')

    const token = signToken({ sub: user.id, email: user.email, role: user.role })
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
      },
    }
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
    })
    if (!user) throw new AppError(404, 'User not found')
    return user
  },
}
