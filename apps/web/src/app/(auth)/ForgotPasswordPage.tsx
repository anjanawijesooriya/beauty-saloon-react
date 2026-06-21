import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { useForgotPassword } from '@/hooks/useProfile'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { mutateAsync: forgotPassword } = useForgotPassword()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    await forgotPassword(data.email)
    setSent(true)
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
            <h2 className="font-display text-3xl italic text-neutral-900 mt-6">Forgot Password</h2>
            <p className="text-neutral-500 text-sm mt-1">Enter your email and we'll send you a reset link</p>
          </motion.div>

          {sent ? (
            <motion.div variants={fadeUp} className="mt-8">
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2">Check your inbox</h3>
                <p className="text-sm text-neutral-500">
                  If an account exists for that email, we've sent a password reset link. Check your spam folder if you don't see it.
                </p>
              </div>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full py-3 border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <motion.form variants={fadeUp} onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email address</label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    errors.email
                      ? 'border-red-400 bg-red-50 focus:ring-red-400 text-red-900 placeholder-red-300'
                      : 'border-neutral-200 focus:ring-brand-400'
                  }`}
                />
                {errors.email && (
                  <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                    <AlertCircle size={11} />{errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 gradient-brand text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </motion.form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
