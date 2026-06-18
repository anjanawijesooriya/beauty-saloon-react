import { Star, Trophy } from 'lucide-react'
import { useLoyaltyLeaderboard } from '@/hooks/useLoyalty'

export default function AdminLoyaltyPage() {
  const { data: leaderboard, isLoading } = useLoyaltyLeaderboard()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Loyalty Leaderboard</h1>
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Star size={14} className="text-gold-400 fill-gold-400" />
          100 pts = LKR 10 discount
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {leaderboard?.slice(0, 3).map((entry, i) => (
          <div key={entry.id} className={`bg-white rounded-2xl shadow-card p-5 text-center ${i === 0 ? 'ring-2 ring-gold-400' : ''}`}>
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl mb-3 ${i === 0 ? 'bg-gold-400 text-white' : i === 1 ? 'bg-neutral-200 text-neutral-600' : 'bg-amber-100 text-amber-600'}`}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
            </div>
            <p className="font-semibold text-neutral-900 text-sm">{entry.user.name}</p>
            <p className="text-xs text-neutral-400 mb-2">{entry.user.email}</p>
            <p className="text-xl font-bold text-brand-500">{entry.balance.toLocaleString()}</p>
            <p className="text-xs text-neutral-400">points</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-neutral-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-medium text-neutral-400 px-6 py-3">Rank</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Customer</th>
                <th className="text-right text-xs font-medium text-neutral-400 px-4 py-3">Points</th>
                <th className="text-right text-xs font-medium text-neutral-400 px-4 py-3">Value (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {!leaderboard?.length ? (
                <tr><td colSpan={4} className="text-center py-12 text-sm text-neutral-400">
                  <Trophy size={32} className="mx-auto mb-2 opacity-30" />No loyalty data yet
                </td></tr>
              ) : leaderboard.map((entry, i) => (
                <tr key={entry.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-bold text-neutral-400">#{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-neutral-800">{entry.user.name}</p>
                    <p className="text-xs text-neutral-400">{entry.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Star size={12} className="text-gold-400 fill-gold-400" />
                      <span className="text-sm font-bold text-neutral-800">{entry.balance.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-neutral-600">
                    LKR {(Math.floor(entry.balance / 100) * 10).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
