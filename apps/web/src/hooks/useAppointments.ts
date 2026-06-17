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
