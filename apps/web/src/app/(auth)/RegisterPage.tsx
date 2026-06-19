import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(80),
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  phone:    z.string().regex(/^\+?[\d\s\-()]{7,15}$/, 'Enter a valid phone number').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

function resolveRegisterError(err: any): { field?: keyof FormValues; message: string } {
  if (!err?.response) {
    return { message: 'Unable to connect. Please check your internet connection.' }
  }
  const status  = err.response?.status
  const message = err.response?.data?.message as string | undefined

  if (status === 409) {
    return {
      field:   'email',
      message: 'This email is already registered. Try signing in instead.',
    }
  }
  if (status === 422) {
    return { message: message || 'Some of your details are invalid. Please review and try again.' }
  }
  if (status === 429) {
    return { message: 'Too many attempts. Please wait a moment and try again.' }
  }
  if (status >= 500) {
    return { message: 'Something went wrong on our end. Please try again in a moment.' }
  }
  return { message: message || 'Registration failed. Please try again.' }
}

export default function RegisterPage() {
  const { register: registerUser } = useAuthStore()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    try {
      await registerUser(data.name, data.email, data.password, data.phone || undefined)
      toast.success('Account created! Welcome to GlowHer.')
      const role = useAuthStore.getState().user?.role
      if (role === 'ADMIN')        navigate('/admin',             { replace: true })
      else if (role === 'STYLIST') navigate('/stylist/dashboard', { replace: true })
      else                         navigate('/')
    } catch (err: any) {
      const { field, message } = resolveRegisterError(err)
      toast.error(message)
      if (field) {
        setError(field, { message })
      } else {
        setError('root', { message })
      }
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
      hasError
        ? 'border-red-400 bg-red-50 focus:ring-red-400 text-red-900 placeholder-red-300'
        : 'border-neutral-200 focus:ring-brand-400'
    }`

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white" style={{ width: `${(i + 1) * 80}px`, height: `${(i + 1) * 80}px`, top: `${20 + i * 10}%`, left: `${10 + i * 12}%`, opacity: 0.3 }} />
          ))}
        </div>
        <div className="relative text-center text-white">
          <Link to="/"><h1 className="font-display text-6xl italic mb-4">GlowHer</h1></Link>
          <p className="text-white/80 text-lg max-w-xs">Join thousands of women discovering beauty in Sri Lanka</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <motion.div className="w-full max-w-sm py-8" variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Link to="/" className="font-display text-2xl italic text-brand-400 lg:hidden">GlowHer</Link>
            <h2 className="font-display text-3xl italic text-neutral-900 mt-6">Create Account</h2>
            <p className="text-neutral-500 text-sm mt-1">Start your beauty journey today</p>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            {/* Form-level error banner */}
            {errors.root && (
              <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{errors.root.message}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Full name</label>
              <input
                {...register('name')}
                type="text"
                autoComplete="name"
                placeholder="Sachini Perera"
                className={inputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                  <AlertCircle size={11} />{errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email address</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass(!!errors.email)}
              />
              {errors.email && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                  <AlertCircle size={11} />{errors.email.message}
                </p>
              )}
              {/* Helpful hint on duplicate email */}
              {errors.email?.message?.includes('already registered') && (
                <p className="text-xs text-neutral-500 mt-1">
                  <Link to="/login" className="text-brand-400 hover:underline font-medium">Sign in instead →</Link>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className={inputClass(!!errors.password) + ' pr-11'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                  <AlertCircle size={11} />{errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Phone <span className="text-neutral-400 font-normal">(optional)</span>
              </label>
              <input
                {...register('phone')}
                type="tel"
                autoComplete="tel"
                placeholder="+94 77 123 4567"
                className={inputClass(!!errors.phone)}
              />
              {errors.phone && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                  <AlertCircle size={11} />{errors.phone.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 gradient-brand text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account…</>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-xs text-neutral-400 text-center">
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.form>

          <motion.p variants={fadeUp} className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 font-medium hover:underline">Sign in</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
