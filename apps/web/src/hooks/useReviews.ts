import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'

export interface Review {
  id: string
  customerId: string
  customer: { name: string; avatarUrl?: string; email?: string }
  stylistId: string
  appointmentId: string
  appointment?: { startsAt: string; stylist?: { user: { name: string } } }
  rating: number
  comment?: string
  isHidden: boolean
  createdAt: string
}

function invalidateReviews() {
  queryClient.invalidateQueries({ queryKey: ['reviews'] })
  queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
  queryClient.invalidateQueries({ queryKey: ['stylists'] })
  queryClient.invalidateQueries({ queryKey: ['admin-stylists'] })
}

// ── Queries ────────────────────────────────────────────────────────────────

export const useStylistReviews = (stylistId: string) =>
  useQuery<Review[]>({
    queryKey: ['reviews', stylistId],
    queryFn: () => api.get(`/reviews/stylist/${stylistId}`).then((r) => r.data),
    enabled: !!stylistId,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })

export const useMyReviews = () =>
  useQuery<Review[]>({
    queryKey: ['reviews', 'me'],
    queryFn: () => api.get('/reviews/stylist/me').then((r) => r.data),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

export const useAdminReviews = () =>
  useQuery<Review[]>({
    queryKey: ['admin-reviews'],
    queryFn: () => api.get('/reviews/admin/all').then((r) => r.data),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

// ── Mutations ──────────────────────────────────────────────────────────────

export const useCreateReview = () =>
  useMutation({
    mutationFn: (dto: { appointmentId: string; stylistId: string; rating: number; comment?: string }) =>
      api.post('/reviews', dto).then((r) => r.data),
    onSuccess: () => {
      invalidateReviews()
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Review submitted!')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to submit review'),
  })

export const useToggleReviewVisibility = () =>
  useMutation({
    mutationFn: (id: string) => api.patch(`/reviews/admin/${id}/toggle`).then((r) => r.data),
    onSuccess: () => invalidateReviews(),
  })

export const useStylistToggleReviewVisibility = () =>
  useMutation({
    mutationFn: (id: string) => api.patch(`/reviews/stylist/me/${id}/toggle`).then((r) => r.data),
    onSuccess: (data: Review) => {
      invalidateReviews()
      toast.success(data.isHidden ? 'Review hidden' : 'Review is now visible')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update review'),
  })

export const useDeleteStylistReview = () =>
  useMutation({
    mutationFn: (id: string) => api.delete(`/reviews/stylist/me/${id}`),
    onSuccess: () => {
      invalidateReviews()
      toast.success('Review deleted')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete review'),
  })
