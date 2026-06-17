import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: registerUser } = useAuthStore()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    try {
      await registerUser(data.name, data.email, data.password, data.phone)
      navigate('/')
    } catch {
      toast.error('Registration failed. Email may already be in use.')
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-brand items-center justify-center">
        <h1 className="font-display text-5xl italic text-white text-center">Join<br />GlowHer</h1>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-3xl italic text-neutral-900 mb-6">Create Account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'name' as const, label: 'Full Name', type: 'text' },
              { name: 'email' as const, label: 'Email', type: 'email' },
              { name: 'password' as const, label: 'Password', type: 'password' },
              { name: 'phone' as const, label: 'Phone (optional)', type: 'tel' },
            ].map(({ name, label, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
                <input {...register(name)} type={type} className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400" />
                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]?.message}</p>}
              </div>
            ))}
            <button type="submit" disabled={isSubmitting} className="w-full py-3 gradient-brand text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-neutral-600">
            Already have an account? <Link to="/login" className="text-brand-400 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
