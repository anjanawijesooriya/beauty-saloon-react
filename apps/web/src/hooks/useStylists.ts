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

// ── Queries ────────────────────────────────────────────────────────────────

export const useStylists = (filters?: { specialty?: string; search?: string; page?: number }) =>
  useQuery<StylistsResponse>({
    queryKey: ['stylists', filters],
    queryFn: () => api.get('/stylists', { params: filters }).then((r) => r.data),
  })

export const useStylist = (id: string) =>
  useQuery<StylistProfile>({
    queryKey: ['stylists', id],
    queryFn: () => api.get(`/stylists/${id}`).then((r) => r.data),
    enabled: !!id,
  })

export const useStylistAvailability = (stylistId: string) =>
  useQuery<Availability[]>({
    queryKey: ['stylists', stylistId, 'availability'],
    queryFn: () => api.get(`/stylists/${stylistId}/availability`).then((r) => r.data),
    enabled: !!stylistId,
  })

export const useStylistSlots = (stylistId: string, date: string, duration: number) =>
  useQuery<string[]>({
    queryKey: ['stylists', stylistId, 'slots', date, duration],
    queryFn: () =>
      api.get(`/stylists/${stylistId}/slots`, { params: { date, duration } }).then((r) => r.data),
    enabled: !!stylistId && !!date && duration > 0,
    staleTime: 0,          // always consider stale so refetch triggers work
    refetchInterval: 20_000, // re-poll every 20 s to catch newly-booked slots
    refetchOnMount: 'always',
  })

export const useMyProfile = () =>
  useQuery<StylistProfile>({
    queryKey: ['stylist-me'],
    queryFn: () => api.get('/stylists/me').then((r) => r.data),
  })

export const useAdminStylists = () =>
  useQuery<StylistProfile[]>({
    queryKey: ['admin-stylists'],
    queryFn: () => api.get('/stylists/admin/all').then((r) => r.data),
  })

// ── Mutations ──────────────────────────────────────────────────────────────

export const useUpdateMyProfile = () =>
  useMutation({
    mutationFn: (data: Partial<{ bio: string; specialities: string[]; experience: number; isAvailable: boolean }>) =>
      api.put('/stylists/me/profile', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylist-me'] })
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
      toast.success('Availability saved')
    },
  })

export const useSetMyServices = () =>
  useMutation({
    mutationFn: (services: Array<{ serviceId: string; priceLKR: number }>) =>
      api.put('/stylists/me/services', { services }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stylist-me'] })
      toast.success('Services updated')
    },
  })

export const useCreateStylistProfile = () =>
  useMutation({
    mutationFn: (userId: string) => api.post('/stylists/admin/profile', { userId }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stylists'] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Stylist profile created')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create profile'),
  })

export const useToggleStylistAvailability = () =>
  useMutation({
    mutationFn: (id: string) => api.patch(`/stylists/admin/${id}/toggle-availability`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-stylists'] }),
  })
