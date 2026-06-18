import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type { Appointment } from '@/types'

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

export const useCreateAppointment = () =>
  useMutation({
    mutationFn: (dto: { stylistId: string; serviceIds: string[]; startsAt: string; notes?: string }) =>
      api.post('/appointments', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment booked successfully!')
    },
    onError: () => toast.error('Failed to book appointment'),
  })

export const useCancelAppointment = () =>
  useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.patch(`/appointments/${id}/cancel`, { reason }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment cancelled')
    },
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
    onError: () => toast.error('Failed to confirm'),
  })

export const useAdminComplete = () =>
  useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}/complete`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] })
      toast.success('Appointment marked complete')
    },
    onError: () => toast.error('Failed to complete'),
  })

export const useStylistConfirm = () =>
  useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}/confirm`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment confirmed')
    },
    onError: () => toast.error('Failed to confirm'),
  })

export const useStylistComplete = () =>
  useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}/complete`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Appointment marked complete')
    },
    onError: () => toast.error('Failed to complete'),
  })
