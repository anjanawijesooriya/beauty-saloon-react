import { Router } from 'express'
import { z } from 'zod'
import { authController } from './auth.controller'
import { authenticate } from '../../middleware/auth.middleware'
import { validate } from '../../middleware/validate.middleware'

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().optional(),
})

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const router = Router()

const ForgotPasswordSchema = z.object({ email: z.string().email() })
const ResetPasswordSchema  = z.object({
  token:    z.string().min(1),
  password: z.string().min(8).max(100),
})

router.post('/register',        validate(RegisterSchema),       authController.register)
router.post('/login',           validate(LoginSchema),          authController.login)
router.post('/forgot-password', validate(ForgotPasswordSchema), authController.forgotPassword)
router.post('/reset-password',  validate(ResetPasswordSchema),  authController.resetPassword)
router.get('/me',      authenticate, authController.me)
router.post('/logout', authenticate, authController.logout)

export default router
