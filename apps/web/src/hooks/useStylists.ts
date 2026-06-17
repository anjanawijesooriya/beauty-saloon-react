import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { StylistProfile, Availability } from '@/types'

interface StylistFilters {
  specialty?: string
  search?: string
  page?: number
  limit?: number
}

export const useStylists = (filters?: StylistFilters) =>
  useQuery<{ stylists: StylistProfile[]; total: number }>({
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
