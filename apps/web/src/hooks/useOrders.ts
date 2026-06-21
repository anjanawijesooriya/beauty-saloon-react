import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type { Order } from '@/types'

interface CreateOrderDto {
  items: { productId: string; quantity: number }[]
  promoCode?: string
  shippingAddress: {
    fullName: string
    addressLine1: string
    addressLine2?: string
    city: string
    phone: string
  }
}

// ── Queries ────────────────────────────────────────────────────────────────

export const useOrders = () =>
  useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then((r) => r.data),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

export const useOrder = (id: string) =>
  useQuery<Order>({
    queryKey: ['orders', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data),
    enabled: !!id,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

export const useAdminOrders = () =>
  useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: () => api.get('/orders/admin/all').then((r) => r.data),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

// ── Mutations ──────────────────────────────────────────────────────────────

export const useCreateOrder = () =>
  useMutation({
    mutationFn: (dto: CreateOrderDto) => api.post('/orders', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      // Stock levels change when an order is placed
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to place order'),
  })

export const usePayOrder = () =>
  useMutation({
    mutationFn: (orderId: string) => api.post(`/orders/${orderId}/pay`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Payment initiation failed'),
  })

export const useAdminDeleteOrder = () =>
  useMutation({
    mutationFn: (id: string) => api.delete(`/orders/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Order deleted')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete order'),
  })

export const useAdminUpdateOrderStatus = () =>
  useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/admin/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order status updated')
    },
  })

export const useVerifyPayment = () =>
  useMutation({
    mutationFn: ({ orderId, paymentIntentId }: { orderId: string; paymentIntentId?: string }) =>
      api.post(`/orders/${orderId}/pay/verify`, { paymentIntentId }).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['orders', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
  })

export const useSimulatePaymentDev = () =>
  useMutation({
    mutationFn: (orderId: string) => api.post(`/orders/${orderId}/pay/simulate`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Simulation failed'),
  })
