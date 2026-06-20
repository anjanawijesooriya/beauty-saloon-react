import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Copy, Check, Star, TrendingUp, ArrowUpRight, ArrowDownRight, Gift, Camera, Trash2, Lock, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth'
import { useLoyaltyBalance } from '@/hooks/useLoyalty'
import { useUpdateProfile, useUploadAvatar, useRemoveAvatar, useChangePassword } from '@/hooks/useProfile'
import { Spinner } from '@/components/ui/Spinner'
import { useMinPending } from '@/hooks/useMinPending'

const profileSchema = z.object({
  name:  z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(9, 'Enter a valid phone number').optional().or(z.literal('')),
})
type ProfileValues = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword:     z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((v) => v.newPassword === v.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type PasswordValues = z.infer<typeof passwordSchema>

function ReferralCard({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}/register?ref=${referralCode}`

  const copy = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gradient-to-br from-brand-50 to-pink-50 rounded-2xl border border-brand-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Gift size={16} className="text-brand-400" />
        <h3 className="text-sm font-semibold text-brand-700">Refer a Friend</h3>
      </div>
      <p className="text-xs text-neutral-500 mb-3">
        Share your link and earn <strong>1,000 points</strong> when they complete their first booking!
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-white border border-brand-100 rounded-xl px-3 py-2 text-xs text-neutral-500 font-mono truncate">
          {link}
        </div>
        <button onClick={copy} className="p-2.5 gradient-brand text-white rounded-xl hover:opacity-90 transition-opacity flex-shrink-0">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <p className="text-xs text-brand-500 mt-2 font-medium">Your code: <span className="font-mono">{referralCode}</span></p>
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { data: loyalty } = useLoyaltyBalance()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { mutateAsync: updateProfile, isPending: saving } = useUpdateProfile()
  const { mutate: uploadAvatar, isPending: uploading } = useUploadAvatar()
  const { mutate: removeAvatar, isPending: removing } = useRemoveAvatar()
  const { mutateAsync: changePassword, isPending: changingPw } = useChangePassword()

  const pendingSave   = useMinPending(saving)
  const pendingUpload = useMinPending(uploading)
  const pendingRemove = useMinPending(removing)

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: user ? { name: user.name, phone: user.phone ?? '' } : undefined,
  })

  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })

  const onSubmit = async (values: ProfileValues) => {
    await updateProfile({ name: values.name, phone: values.phone || undefined })
  }

  const onPasswordSubmit = async (values: PasswordValues) => {
    await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
    resetPw()
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadAvatar(file)
    e.target.value = ''
  }

  if (!user) return null

  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl italic text-neutral-900 mb-8">My Profile</h1>

      <div className="space-y-5">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 bg-neutral-100">
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full gradient-brand flex items-center justify-center text-white text-3xl font-bold">{initials}</div>
                }
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={pendingUpload}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-neutral-200 rounded-full flex items-center justify-center shadow-sm hover:bg-neutral-50 transition-colors disabled:opacity-60"
                title="Upload photo"
              >
                {pendingUpload ? <Spinner variant="dark" size={13} /> : <Camera size={13} className="text-neutral-600" />}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            {user.avatarUrl && (
              <button
                type="button"
                onClick={() => removeAvatar()}
                disabled={pendingRemove}
                className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                {pendingRemove ? <Spinner variant="dark" size={11} /> : <Trash2 size={11} />}
                Remove photo
              </button>
            )}
            <p className="mt-2 text-xs text-neutral-400">{user.email}</p>
          </div>

          {/* Edit form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Full Name</label>
              <input
                {...register('name')}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                placeholder="Your name"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Phone Number</label>
              <input
                {...register('phone')}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                placeholder="+94 71 234 5678"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
            <button
              type="submit"
              disabled={pendingSave}
              className="w-full py-3 gradient-brand text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {pendingSave ? <><Spinner />Saving…</> : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={16} className="text-brand-400" />
            <h3 className="font-semibold text-neutral-900">Change Password</h3>
          </div>
          <form onSubmit={handlePwSubmit(onPasswordSubmit)} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  {...registerPw('currentPassword')}
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
                <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.currentPassword.message}</p>}
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  {...registerPw('newPassword')}
                  type={showNew ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
                <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwErrors.newPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.newPassword.message}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  {...registerPw('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={changingPw}
              className="w-full py-3 gradient-brand text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {changingPw ? <><Spinner />Updating…</> : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Loyalty points */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-gold-400 fill-gold-400" />
              <h3 className="font-semibold text-neutral-900">Loyalty Points</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-neutral-900">{loyalty?.balance ?? 0}</p>
              <p className="text-xs text-neutral-400">≈ LKR {Math.floor((loyalty?.balance ?? 0) / 100) * 10} discount</p>
            </div>
          </div>

          <div className="h-2 bg-neutral-100 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full gradient-brand rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, ((loyalty?.balance ?? 0) % 1000) / 10)}%` }}
            />
          </div>

          {loyalty?.transactions && loyalty.transactions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2">Recent transactions</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {loyalty.transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                    <div className="flex items-center gap-2">
                      {tx.points > 0
                        ? <ArrowUpRight size={14} className="text-emerald-500" />
                        : <ArrowDownRight size={14} className="text-red-400" />}
                      <span className="text-xs text-neutral-600">{tx.reason}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${tx.points > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {tx.points > 0 ? '+' : ''}{tx.points}
                      </span>
                      <span className="text-xs text-neutral-300">{format(new Date(tx.createdAt), 'd MMM')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loyalty?.transactions?.length && (
            <p className="text-xs text-neutral-400 text-center py-4">
              <TrendingUp size={20} className="mx-auto mb-1 opacity-30" />
              Complete appointments to earn points
            </p>
          )}
        </div>

        {/* Referral */}
        {user.referralCode && <ReferralCard referralCode={user.referralCode} />}
      </div>
    </div>
  )
}
