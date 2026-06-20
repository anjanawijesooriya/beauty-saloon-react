import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuthStore, type AuthUser } from '@/store/auth'

const apiError = (err: any, fallback: string) => err?.response?.data?.message || fallback

export const useUpdateProfile = () =>
  useMutation({
    mutationFn: (dto: { name?: string; phone?: string }) =>
      api.put<AuthUser>('/users/me', dto).then((r) => r.data),
    onSuccess: (user) => {
      useAuthStore.getState().setUser(user)
      toast.success('Profile updated')
    },
    onError: (err: any) => toast.error(apiError(err, 'Failed to update profile')),
  })

export const useUploadAvatar = () =>
  useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('avatar', file)
      return api
        .post<{ avatarUrl: string }>('/users/me/avatar', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data)
    },
    onSuccess: (data) => {
      const user = useAuthStore.getState().user
      if (user) useAuthStore.getState().setUser({ ...user, avatarUrl: data.avatarUrl })
      toast.success('Profile photo updated')
    },
    onError: (err: any) => toast.error(apiError(err, 'Failed to upload photo')),
  })

export const useRemoveAvatar = () =>
  useMutation({
    mutationFn: () => api.delete('/users/me/avatar'),
    onSuccess: () => {
      const user = useAuthStore.getState().user
      if (user) useAuthStore.getState().setUser({ ...user, avatarUrl: null })
      toast.success('Profile photo removed')
    },
    onError: (err: any) => toast.error(apiError(err, 'Failed to remove photo')),
  })
