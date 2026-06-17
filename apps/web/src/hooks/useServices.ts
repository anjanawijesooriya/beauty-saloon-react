import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type { Service, ServiceCategory } from '@/types'

export interface ServiceFilters {
  categoryId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}

export interface ServicesResponse {
  services: Service[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ── Queries ────────────────────────────────────────────────────────────────

export const useServiceCategories = () =>
  useQuery<ServiceCategory[]>({
    queryKey: ['service-categories'],
    queryFn: () => api.get('/services/categories').then((r) => r.data),
    staleTime: 1000 * 60 * 10,
  })

export const useServices = (filters?: ServiceFilters) =>
  useQuery<ServicesResponse>({
    queryKey: ['services', filters],
    queryFn: () => api.get('/services', { params: filters }).then((r) => r.data),
  })

export const useService = (id: string) =>
  useQuery<Service>({
    queryKey: ['services', id],
    queryFn: () => api.get(`/services/${id}`).then((r) => r.data),
    enabled: !!id,
  })

// ── Admin mutations ────────────────────────────────────────────────────────

interface CreateServiceDto {
  categoryId: string
  name: string
  slug: string
  description?: string
  durationMins: number
  basePriceLKR: number
  imageUrl?: string
}

export const useCreateService = () =>
  useMutation({
    mutationFn: (dto: CreateServiceDto) => api.post('/services', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service created')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create service'),
  })

export const useUpdateService = () =>
  useMutation({
    mutationFn: ({ id, ...data }: Partial<CreateServiceDto> & { id: string }) =>
      api.put(`/services/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service updated')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update service'),
  })

export const useDeleteService = () =>
  useMutation({
    mutationFn: (id: string) => api.delete(`/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service removed')
    },
  })

export const useCreateCategory = () =>
  useMutation({
    mutationFn: (dto: { name: string; slug: string; imageUrl?: string; order?: number }) =>
      api.post('/services/categories', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] })
      toast.success('Category created')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create category'),
  })
