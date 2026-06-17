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

function signToken(payload: { sub: string; email: string; role: string }) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions)
}

export const authService = {
  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new AppError(409, 'Email already registered')

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const user = await prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash, phone: dto.phone },
    })

    await sendWelcomeEmail(user.email, user.name).catch(() => {})

    const token = signToken({ sub: user.id, email: user.email, role: user.role })
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
  },

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } })
    if (!user || !user.passwordHash) throw new AppError(401, 'Invalid credentials')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new AppError(401, 'Invalid credentials')

    if (!user.isActive) throw new AppError(403, 'Account deactivated')

    const token = signToken({ sub: user.id, email: user.email, role: user.role })
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, phone: true, avatarUrl: true },
    })
    if (!user) throw new AppError(404, 'User not found')
    return user
  },
}
