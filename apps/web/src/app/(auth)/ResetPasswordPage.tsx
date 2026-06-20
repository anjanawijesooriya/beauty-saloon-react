import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { useResetPassword } from '@/hooks/useProfile'
import { toast } from 'sonner'

const schema = z.object({
  password:        z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((v) => v.password === v.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const [done, setDone] = useState(false)
  const [showPw, setShowPw]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { mutateAsync: resetPassword } = useResetPassword()

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <h2 className="font-semibold text-neutral-900 mb-2">Invalid reset link</h2>
          <p className="text-sm text-neutral-500 mb-6">This link is missing a reset token. Please request a new one.</p>
          <Link to="/forgot-password" className="inline-block px-6 py-3 gradient-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            Request Reset Link
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: FormValues) => {
    try {
      await resetPassword({ token, password: data.password })
      setDone(true)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Reset link is invalid or has expired'
      setError('root', { message: msg })
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{ width: `${(i + 1) * 80}px`, height: `${(i + 1) * 80}px`, top: `${20 + i * 10}%`, left: `${10 + i * 12}%`, opacity: 0.3 }}
            />
          ))}
        </div>
        <div className="relative text-center text-white">
          <Link to="/"><h1 className="font-display text-6xl italic mb-4">GlowHer</h1></Link>
          <p className="text-white/80 text-lg max-w-xs">Sri Lanka's premier beauty salon booking platform</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div className="w-full max-w-sm" variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Link to="/" className="font-display text-2xl italic text-brand-400 lg:hidden">GlowHer</Link>
            <h2 className="font-display text-3xl italic text-neutral-900 mt-6">Set New Password</h2>
            <p className="text-neutral-500 text-sm mt-1">Choose a strong password for your account</p>
          </motion.div>

          {done ? (
            <motion.div variants={fadeUp} className="mt-8">
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">Password updated!</h3>
                <p className="text-sm text-neutral-500 mb-6">Your password has been changed. You can now sign in with your new password.</p>
              </div>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full py-3 gradient-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Go to Sign In
              </button>
            </motion.div>
          ) : (
            <motion.form variants={fadeUp} onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              {errors.root && (
                <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{errors.root.message}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min 8 characters"
                    className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      errors.password ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-neutral-200 focus:ring-brand-400'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5"><AlertCircle size={11} />{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      errors.confirmPassword ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-neutral-200 focus:ring-brand-400'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5"><AlertCircle size={11} />{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 gradient-brand text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating…</>
                ) : (
                  'Update Password'
                )}
              </button>
            </motion.form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
