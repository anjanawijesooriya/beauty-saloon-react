import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'CUSTOMER' | 'STYLIST' | 'ADMIN'
  phone?: string
  isActive: boolean
  createdAt: string
}

export interface AdminUsersResponse {
  users: AdminUser[]
  total: number
  page: number
  limit: number
}

function invalidateUsers() {
  queryClient.invalidateQueries({ queryKey: ['admin-users'] })
}

export const useAdminUsers = (role?: string) =>
  useQuery<AdminUsersResponse>({
    queryKey: ['admin-users', role],
    queryFn: () => api.get('/users', { params: { role, limit: 100 } }).then((r) => r.data),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

export const useToggleUserStatus = () =>
  useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/toggle-status`).then((r) => r.data),
    onSuccess: (data: AdminUser) => {
      invalidateUsers()
      toast.success(data.isActive ? 'Account activated' : 'Account deactivated')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to update status'),
  })

export const useDeleteUser = () =>
  useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      invalidateUsers()
      // Also refresh stylists in case a stylist was removed (admin page edge case)
      queryClient.invalidateQueries({ queryKey: ['admin-stylists'] })
      toast.success('Account permanently deleted')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to delete account'),
  })
