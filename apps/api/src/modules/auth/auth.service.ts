import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../../config/database'
import { env } from '../../config/env'
import { AppError } from '../../middleware/error.middleware'
import { sendWelcomeEmail, sendPasswordResetEmail } from '../../lib/mailer'

interface RegisterDto {
  name: string
  email: string
  password: string
  phone?: string
  refCode?: string
}

function generateReferralCode(name: string): string {
  const base = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4).padEnd(4, 'X')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${base}${rand}`
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
    const referralCode = generateReferralCode(dto.name)
    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        phone:        dto.phone ?? null,
        referralCode,
        referredBy:   dto.refCode ?? null,
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
    if (!user || !user.passwordHash) throw new AppError(404, 'No account found with this email address')

    const valid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!valid) throw new AppError(401, 'Incorrect password. Please try again.')

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

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    // Always return success to avoid leaking which emails exist
    if (!user || !user.isActive) return

    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    })

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`
    sendPasswordResetEmail(user.email, user.name, resetUrl).catch((e) =>
      console.warn('[mailer] password reset email failed:', e.message)
    )
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { resetToken: token } })
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new AppError(400, 'Reset link is invalid or has expired')
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    })
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
        referralCode: true,
        isActive: true,
        createdAt: true,
      },
    })
    if (!user) throw new AppError(404, 'User not found')
    return user
  },
}
