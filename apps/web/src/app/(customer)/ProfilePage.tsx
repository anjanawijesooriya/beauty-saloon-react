import { useState } from 'react'
import { Copy, Check, Star, TrendingUp, ArrowUpRight, ArrowDownRight, Gift } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth'
import { useLoyaltyBalance } from '@/hooks/useLoyalty'

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl italic text-neutral-900 mb-8">My Profile</h1>

      {user && (
        <div className="space-y-5">
          {/* Profile card */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center text-white text-2xl font-bold">
                {user.name[0]}
              </div>
              <div>
                <h2 className="font-semibold text-xl text-neutral-900">{user.name}</h2>
                <p className="text-neutral-500 text-sm">{user.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-50 rounded-xl p-4">
                <p className="text-xs text-brand-600 font-medium">Role</p>
                <p className="text-neutral-900 font-semibold mt-1">{user.role}</p>
              </div>
              <div className="bg-brand-50 rounded-xl p-4">
                <p className="text-xs text-brand-600 font-medium">Phone</p>
                <p className="text-neutral-900 font-semibold mt-1">{user.phone || '—'}</p>
              </div>
            </div>
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
      )}
    </div>
  )
}
