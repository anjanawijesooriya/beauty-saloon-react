import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Service, ServiceCategory } from '@/types'

interface ServiceFilters {
  categoryId?: string
  search?: string
  page?: number
  limit?: number
}

export const useServices = (filters?: ServiceFilters) =>
  useQuery<{ services: Service[]; total: number }>({
    queryKey: ['services', filters],
    queryFn: () => api.get('/services', { params: filters }).then((r) => r.data),
  })

export const useServiceCategories = () =>
  useQuery<ServiceCategory[]>({
    queryKey: ['service-categories'],
    queryFn: () => api.get('/services/categories').then((r) => r.data),
  })

export const useService = (id: string) =>
  useQuery<Service>({
    queryKey: ['services', id],
    queryFn: () => api.get(`/services/${id}`).then((r) => r.data),
    enabled: !!id,
  })
