import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type { Appointment } from '@/types'

function apiError(err: any, fallback: string): string {
  if (!err?.response) return 'No internet connection. Please check and try again.'
  return (err?.response?.data?.message as string) || fallback
}

export const useAppointments = () =>
  useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => api.get('/appointments').then((r) => r.data),
  })

export const useAppointment = (id: string) =>
  useQuery<Appointment>({
    queryKey: ['appointments', id],
    queryFn: () => api.get(`/appointments/${id}`).then((r) => r.data),
    enabled: !!id,
  })

// No onError here — Step4Confirm handles errors directly so it can navigate on 409
export const useCreateAppointment = () =>
  useMutation({
    mutationFn: (dto: { stylistId: string; serviceIds: string[]; startsAt: string; notes?: string }) =>
      api.post('/appointments', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })

export const useCancelAppointment = () =>
  useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.patch(`/appointments/${id}/cancel`, { reason }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment cancelled')
    },
    onError: (err: any) => toast.error(apiError(err, 'Failed to cancel appointment')),
  })

export const useAdminAppointments = () =>
  useQuery<Appointment[]>({
    queryKey: ['admin-appointments'],
    queryFn: () => api.get('/appointments').then((r) => r.data),
  })

export const useAdminConfirm = () =>
  useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}/confirm`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] })
      toast.success('Appointment confirmed')
    },
    onError: (err: any) => toast.error(apiError(err, 'Failed to confirm appointment')),
  })

export const useAdminComplete = () =>
  useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}/complete`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] })
      toast.success('Appointment marked as completed')
    },
    onError: (err: any) => toast.error(apiError(err, 'Failed to mark appointment as completed')),
  })

export const useStylistConfirm = () =>
  useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}/confirm`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment confirmed')
    },
    onError: (err: any) => toast.error(apiError(err, 'Failed to confirm appointment')),
  })

export const useStylistComplete = () =>
  useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}/complete`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment marked as completed')
    },
    onError: (err: any) => toast.error(apiError(err, 'Failed to mark appointment as completed')),
  })
