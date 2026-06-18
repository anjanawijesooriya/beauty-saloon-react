import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'

export interface Review {
  id: string
  customerId: string
  customer: { name: string; avatarUrl?: string }
  stylistId: string
  appointmentId: string
  rating: number
  comment?: string
  isHidden: boolean
  createdAt: string
}

export const useStylistReviews = (stylistId: string) =>
  useQuery<Review[]>({
    queryKey: ['reviews', stylistId],
    queryFn: () => api.get(`/reviews/stylist/${stylistId}`).then((r) => r.data),
    enabled: !!stylistId,
  })

export const useAdminReviews = () =>
  useQuery<(Review & { appointment: { startsAt: string }; customer: { email: string; name: string } })[]>({
    queryKey: ['admin-reviews'],
    queryFn: () => api.get('/reviews/admin/all').then((r) => r.data),
  })

export const useCreateReview = () =>
  useMutation({
    mutationFn: (dto: { appointmentId: string; stylistId: string; rating: number; comment?: string }) =>
      api.post('/reviews', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Review submitted!')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to submit review'),
  })

export const useToggleReviewVisibility = () =>
  useMutation({
    mutationFn: (id: string) => api.patch(`/reviews/admin/${id}/toggle`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
  })
