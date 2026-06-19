import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type { Product } from '@/types'

export interface ProductFilters {
  search?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function invalidateProducts() {
  queryClient.invalidateQueries({ queryKey: ['products'] })
}

// ── Queries (polled so stock/price changes appear without refresh) ──────────

export const useProducts = (filters?: ProductFilters) =>
  useQuery<ProductsResponse>({
    queryKey: ['products', filters],
    queryFn: () => api.get('/products', { params: filters }).then((r) => r.data),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

export const useProduct = (slug: string) =>
  useQuery<Product>({
    queryKey: ['products', slug],
    queryFn: () => api.get(`/products/${slug}`).then((r) => r.data),
    enabled: !!slug,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

// ── Admin mutations ────────────────────────────────────────────────────────

interface CreateProductDto {
  name: string
  slug: string
  description?: string
  priceLKR: number
  stock: number
  imageUrls?: string[]
  categoryId: string
}

export const useCreateProduct = () =>
  useMutation({
    mutationFn: (dto: CreateProductDto) => api.post('/products', dto).then((r) => r.data),
    onSuccess: () => { invalidateProducts(); toast.success('Product created') },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create product'),
  })

export const useUpdateProduct = () =>
  useMutation({
    mutationFn: ({ id, ...data }: Partial<CreateProductDto> & { id: string }) =>
      api.put(`/products/${id}`, data).then((r) => r.data),
    onSuccess: () => { invalidateProducts(); toast.success('Product updated') },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update product'),
  })

export const useDeleteProduct = () =>
  useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => { invalidateProducts(); toast.success('Product removed') },
  })
