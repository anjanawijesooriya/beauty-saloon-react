import { useState } from 'react'
import { format } from 'date-fns'
import { Star, Eye, EyeOff } from 'lucide-react'
import { useAdminReviews, useToggleReviewVisibility } from '@/hooks/useReviews'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type { Review } from '@/hooks/useReviews'

export default function AdminReviewsPage() {
  const { data: reviews, isLoading } = useAdminReviews()
  const { mutate: toggle, isPending: toggling } = useToggleReviewVisibility()
  const [toggleTarget, setToggleTarget] = useState<Review | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Reviews</h1>
        <p className="text-sm text-neutral-400">{reviews?.length ?? 0} total</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-medium text-neutral-400 px-6 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Stylist</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Rating</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Comment</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {!reviews?.length ? (
                <tr><td colSpan={6} className="text-center py-12 text-sm text-neutral-400">No reviews yet</td></tr>
              ) : reviews.map((review) => (
                <tr key={review.id} className={`hover:bg-neutral-50 transition-colors ${review.isHidden ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-3">
                    <p className="text-sm font-medium text-neutral-800">{review.customer.name}</p>
                    <p className="text-xs text-neutral-400">{review.customer.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700 font-medium">
                    {review.appointment?.stylist?.user?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} className={i < review.rating ? 'text-gold-400 fill-gold-400' : 'text-neutral-200'} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 max-w-xs">
                    <p className="line-clamp-2">{review.comment || <span className="text-neutral-300 italic">No comment</span>}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-400">
                    {format(new Date(review.createdAt), 'd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setToggleTarget(review)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        review.isHidden
                          ? 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                      }`}
                    >
                      {review.isHidden ? <><EyeOff size={12} /> Hidden</> : <><Eye size={12} /> Visible</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toggleTarget && (
        <ConfirmModal
          variant="warning"
          title={toggleTarget.isHidden ? 'Make review visible?' : 'Hide this review?'}
          description={
            toggleTarget.isHidden
              ? `This review by ${toggleTarget.customer.name} will become publicly visible on the stylist's profile.`
              : `This review by ${toggleTarget.customer.name} will be hidden from all public views.`
          }
          confirmLabel={toggleTarget.isHidden ? 'Yes, make visible' : 'Yes, hide review'}
          isPending={toggling}
          onConfirm={() => toggle(toggleTarget.id, { onSuccess: () => setToggleTarget(null) })}
          onClose={() => setToggleTarget(null)}
        />
      )}
    </div>
  )
}
