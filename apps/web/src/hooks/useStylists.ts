import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type { StylistProfile, Availability } from '@/types'

export interface StylistsResponse {
  stylists: StylistProfile[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Invalidate every cache key that surfaces stylist data
function invalidateStylists() {
  queryClient.invalidateQueries({ queryKey: ['stylists'] })
  queryClient.invalidateQueries({ queryKey: ['admin-stylists'] })
  queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
}

// ── Public / customer queries (polled every 30 s) ──────────────────────────

export const useStylists = (filters?: { specialty?: string; search?: string; page?: number }) =>
  useQuery<StylistsResponse>({
    queryKey: ['stylists', filters],
    queryFn: () => api.get('/stylists', { params: filters }).then((r) => r.data),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

export const useStylist = (id: string) =>
  useQuery<StylistProfile>({
    queryKey: ['stylists', id],
    queryFn: () => api.get(`/stylists/${id}`).then((r) => r.data),
    enabled: !!id,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

export const useStylistAvailability = (stylistId: string) =>
  useQuery<Availability[]>({
    queryKey: ['stylists', stylistId, 'availability'],
    queryFn: () => api.get(`/stylists/${stylistId}/availability`).then((r) => r.data),
    enabled: !!stylistId,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

export const useStylistSlots = (stylistId: string, date: string, duration: number) =>
  useQuery<string[]>({
    queryKey: ['stylists', stylistId, 'slots', date, duration],
    queryFn: () =>
      api.get(`/stylists/${stylistId}/slots`, { params: { date, duration } }).then((r) => r.data),
    enabled: !!stylistId && !!date && duration > 0,
    staleTime: 0,
    refetchInterval: 20_000,
    refetchOnMount: 'always',
  })

export const useMyProfile = () =>
  useQuery<StylistProfile>({
    queryKey: ['stylist-me'],
    queryFn: () => api.get('/stylists/me').then((r) => r.data),
  })

// ── Admin queries (polled every 30 s) ─────────────────────────────────────

export const useAdminStylists = () =>
  useQuery<StylistProfile[]>({
    queryKey: ['admin-stylists'],
    queryFn: () => api.get('/stylists/admin/all').then((r) => r.data),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

// ── Mutations ──────────────────────────────────────────────────────────────

export const useUpdateMyProfile = () =>
  useMutation({
    mutationFn: (data: Partial<{ bio: string; specialities: string[]; experience: number; isAvailable: boolean }>) =>
      api.put('/stylists/me/profile', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylist-me'] })
      // Public-facing pages also need to reflect profile changes
      invalidateStylists()
      toast.success('Profile updated')
    },
    onError: () => toast.error('Failed to update profile'),
  })

export const useSetMyAvailability = () =>
  useMutation({
    mutationFn: (slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>) =>
      api.put('/stylists/me/availability', { slots }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylist-me'] })
      // Customer-facing availability and slot queries must reflect changes immediately
      invalidateStylists()
      toast.success('Availability saved')
    },
  })

export const useSetMyServices = () =>
  useMutation({
    mutationFn: (services: Array<{ serviceId: string; priceLKR: number }>) =>
      api.put('/stylists/me/services', { services }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylist-me'] })
      invalidateStylists()
      toast.success('Services updated')
    },
  })

export const useCreateStylistProfile = () =>
  useMutation({
    mutationFn: (userId: string) => api.post('/stylists/admin/profile', { userId }).then((r) => r.data),
    onSuccess: () => {
      invalidateStylists()
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Stylist profile created')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create profile'),
  })

export const useToggleStylistAvailability = () =>
  useMutation({
    mutationFn: (id: string) => api.patch(`/stylists/admin/${id}/toggle-availability`).then((r) => r.data),
    onSuccess: () => {
      invalidateStylists()
    },
  })

export const useDeleteStylist = () =>
  useMutation({
    mutationFn: (id: string) => api.delete(`/stylists/admin/${id}`),
    onSuccess: () => {
      invalidateStylists()
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success('Stylist account permanently deleted')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete stylist account'),
  })
