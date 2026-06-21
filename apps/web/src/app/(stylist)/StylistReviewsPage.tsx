import { useState } from 'react'
import { format } from 'date-fns'
import { Star, MessageSquare, Eye, EyeOff, Trash2 } from 'lucide-react'
import {
  useMyReviews,
  useStylistToggleReviewVisibility,
  useDeleteStylistReview,
} from '@/hooks/useReviews'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type { Review } from '@/hooks/useReviews'

type ReviewAction = { type: 'toggle' | 'delete'; review: Review }

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200 fill-neutral-200'}
        />
      ))}
    </div>
  )
}

export default function StylistReviewsPage() {
  const { data: reviews = [], isLoading } = useMyReviews()
  const { mutate: toggleVisibility, isPending: toggling } = useStylistToggleReviewVisibility()
  const { mutate: deleteReview, isPending: deleting } = useDeleteStylistReview()
  const [action, setAction] = useState<ReviewAction | null>(null)

  const visibleReviews = reviews.filter((r) => !r.isHidden)
  const avgRating = visibleReviews.length
    ? visibleReviews.reduce((s, r) => s + r.rating, 0) / visibleReviews.length
    : 0

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: visibleReviews.filter((r) => r.rating === star).length,
  }))

  const handleConfirm = () => {
    if (!action) return
    if (action.type === 'toggle') {
      toggleVisibility(action.review.id, { onSuccess: () => setAction(null) })
    } else {
      deleteReview(action.review.id, { onSuccess: () => setAction(null) })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-neutral-100 rounded-2xl" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-neutral-100 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Reviews</h1>
        <p className="text-neutral-400 text-sm mt-0.5">What your clients are saying</p>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col sm:flex-row gap-6">
        <div className="text-center sm:border-r sm:border-neutral-100 sm:pr-6 flex-shrink-0">
          <p className="text-5xl font-bold text-neutral-900">{avgRating.toFixed(1)}</p>
          <Stars rating={Math.round(avgRating)} />
          <p className="text-xs text-neutral-400 mt-2">
            {visibleReviews.length} visible · {reviews.length} total
          </p>
        </div>
        <div className="flex-1 space-y-2">
          {ratingBreakdown.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 w-4 text-right">{star}</span>
              <Star size={11} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
              <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full gradient-brand rounded-full transition-all"
                  style={{ width: visibleReviews.length ? `${(count / visibleReviews.length) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-xs text-neutral-400 w-4">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card flex flex-col items-center justify-center py-16 text-neutral-300">
          <MessageSquare size={40} className="mb-3" />
          <p className="text-sm">No reviews yet</p>
          <p className="text-xs mt-1">Complete appointments to start receiving reviews</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-2xl shadow-card p-5 transition-opacity ${review.isHidden ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden">
                    {review.customer.avatarUrl
                      ? <img src={review.customer.avatarUrl} alt={review.customer.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full gradient-brand flex items-center justify-center text-white text-sm font-bold">{review.customer.name[0]}</div>
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-neutral-900 text-sm">{review.customer.name}</p>
                      {review.isHidden && (
                        <span className="text-xs bg-neutral-100 text-neutral-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <EyeOff size={10} /> Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">{format(new Date(review.createdAt), 'd MMM yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Stars rating={review.rating} />
                  <button
                    onClick={() => setAction({ type: 'toggle', review })}
                    title={review.isHidden ? 'Make visible' : 'Hide review'}
                    className="p-1.5 text-neutral-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    {review.isHidden ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button
                    onClick={() => setAction({ type: 'delete', review })}
                    title="Delete review"
                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {review.comment && (
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed pl-12">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {action && (
        <ConfirmModal
          variant={action.type === 'delete' ? 'danger' : 'warning'}
          title={
            action.type === 'delete'
              ? 'Delete this review?'
              : action.review.isHidden
              ? 'Make this review visible?'
              : 'Hide this review?'
          }
          description={
            action.type === 'delete'
              ? `This will permanently remove the review by ${action.review.customer.name}. This cannot be undone.`
              : action.review.isHidden
              ? `The review by ${action.review.customer.name} will appear publicly on your profile.`
              : `The review by ${action.review.customer.name} will be hidden from your public profile.`
          }
          confirmLabel={
            action.type === 'delete'
              ? 'Yes, delete'
              : action.review.isHidden
              ? 'Yes, make visible'
              : 'Yes, hide'
          }
          isPending={toggling || deleting}
          onConfirm={handleConfirm}
          onClose={() => setAction(null)}
        />
      )}
    </div>
  )
}
