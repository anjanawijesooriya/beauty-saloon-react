import { useState } from 'react'
import { format, isPast } from 'date-fns'
import { CalendarCheck, Clock, CheckCheck, XCircle, UserX, AlertCircle } from 'lucide-react'
import {
  useAppointments,
  useStylistConfirm,
  useStylistComplete,
  useCancelAppointment,
  useNoShow,
} from '@/hooks/useAppointments'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type { Appointment, AppointmentStatus } from '@/types'

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING:   'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW:   'No Show',
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING:   'bg-amber-50 text-amber-600 border-amber-100',
  CONFIRMED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  COMPLETED: 'bg-blue-50 text-blue-600 border-blue-100',
  CANCELLED: 'bg-red-50 text-red-400 border-red-100',
  NO_SHOW:   'bg-neutral-100 text-neutral-400 border-neutral-200',
}

type ActionType = 'confirm' | 'cancel' | 'complete' | 'noshow' | 'expire'
type PendingAction = { type: ActionType; appt: Appointment }
type Filter = AppointmentStatus | 'ALL'

const ACTION_CONFIG: Record<ActionType, {
  variant: 'default' | 'danger' | 'warning'
  title: (appt: Appointment) => string
  description: (appt: Appointment) => string
  confirmLabel: string
}> = {
  confirm: {
    variant: 'default',
    title: (a) => `Confirm booking for ${a.customer.name}?`,
    description: (a) => `This will confirm the appointment on ${format(new Date(a.startsAt), 'EEEE, d MMM · h:mm a')}. The customer will be notified.`,
    confirmLabel: 'Yes, confirm',
  },
  cancel: {
    variant: 'danger',
    title: () => 'Cancel this appointment?',
    description: (a) => `The booking for ${a.customer.name} on ${format(new Date(a.startsAt), 'd MMM · h:mm a')} will be cancelled.`,
    confirmLabel: 'Yes, cancel',
  },
  complete: {
    variant: 'default',
    title: () => 'Mark as completed?',
    description: (a) => `Confirm that the appointment with ${a.customer.name} has been completed. Loyalty points will be awarded.`,
    confirmLabel: 'Yes, mark complete',
  },
  noshow: {
    variant: 'warning',
    title: () => 'Mark as no-show?',
    description: (a) => `${a.customer.name} did not attend this appointment. No loyalty points will be awarded. This cannot be undone.`,
    confirmLabel: 'Yes, mark no-show',
  },
  expire: {
    variant: 'warning',
    title: () => 'Cancel overdue booking?',
    description: (a) => `This booking from ${a.customer.name} was never confirmed and the appointment time has passed. Cancel it to clean up your schedule.`,
    confirmLabel: 'Yes, cancel it',
  },
}

export default function StylistAppointmentsPage() {
  const { data: appointments = [], isLoading } = useAppointments()
  const confirm  = useStylistConfirm()
  const complete = useStylistComplete()
  const cancel   = useCancelAppointment()
  const noShow   = useNoShow()
  const [filter, setFilter]         = useState<Filter>('ALL')
  const [pendingAction, setPending] = useState<PendingAction | null>(null)

  const tabs: { key: Filter; label: string }[] = [
    { key: 'ALL',       label: 'All' },
    { key: 'PENDING',   label: 'Pending' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
    { key: 'NO_SHOW',   label: 'No Show' },
  ]

  const visible = filter === 'ALL'
    ? appointments
    : appointments.filter((a) => a.status === filter)

  const sorted = [...visible].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())

  const handleConfirm = () => {
    if (!pendingAction) return
    const { type, appt } = pendingAction
    const done = () => setPending(null)
    if (type === 'confirm')  confirm.mutate(appt.id,                          { onSuccess: done })
    if (type === 'cancel')   cancel.mutate({ id: appt.id },                   { onSuccess: done })
    if (type === 'complete') complete.mutate(appt.id,                         { onSuccess: done })
    if (type === 'noshow')   noShow.mutate(appt.id,                           { onSuccess: done })
    if (type === 'expire')   cancel.mutate({ id: appt.id, reason: 'expired' }, { onSuccess: done })
  }

  const isMutating = confirm.isPending || complete.isPending || cancel.isPending || noShow.isPending

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Appointments</h1>
          <p className="text-neutral-400 text-sm mt-0.5">Manage and take action on your bookings</p>
        </div>
        <div className="text-sm text-neutral-400">{appointments.length} total</div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ key, label }) => {
          const count = key === 'ALL' ? appointments.length : appointments.filter((a) => a.status === key).length
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? 'gradient-brand text-white shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300'
              }`}
            >
              {label} <span className="ml-1 opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card flex flex-col items-center justify-center py-16 text-neutral-300">
          <CalendarCheck size={40} className="mb-3" />
          <p className="text-sm">No appointments here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((appt) => {
            const isOverduePending = appt.status === 'PENDING' && isPast(new Date(appt.startsAt))
            return (
              <div key={appt.id} className={`bg-white rounded-2xl shadow-card p-5 ${isOverduePending ? 'border border-amber-200' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  {/* Left: customer + details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {appt.customer.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-neutral-900 text-sm">{appt.customer.name}</p>
                          {isOverduePending && (
                            <span className="flex items-center gap-1 text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
                              <AlertCircle size={10} /> Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400">{appt.customer.email}</p>
                      </div>
                    </div>
                    <div className="ml-10 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Clock size={11} />
                        {format(new Date(appt.startsAt), 'EEEE, d MMM yyyy · h:mm a')}
                        <span className="text-neutral-300">→</span>
                        {format(new Date(appt.endsAt), 'h:mm a')}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {appt.items.map((item) => (
                          <span key={item.id} className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
                            {item.service.name}
                          </span>
                        ))}
                      </div>
                      {appt.notes && (
                        <p className="text-xs text-neutral-400 italic mt-1">Note: {appt.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: status + amount + actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[appt.status]}`}>
                      {STATUS_LABELS[appt.status]}
                    </span>
                    <span className="font-bold text-neutral-900 text-sm">
                      LKR {Number(appt.totalLKR).toLocaleString()}
                    </span>
                    <div className="flex gap-1.5">
                      {/* Overdue PENDING: only offer cancel/expire, not confirm */}
                      {appt.status === 'PENDING' && isOverduePending && (
                        <button
                          onClick={() => setPending({ type: 'expire', appt })}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                        >
                          <XCircle size={13} /> Cancel Overdue
                        </button>
                      )}
                      {/* Active PENDING: confirm or cancel */}
                      {appt.status === 'PENDING' && !isOverduePending && (
                        <>
                          <button
                            onClick={() => setPending({ type: 'confirm', appt })}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            <CheckCheck size={13} /> Confirm
                          </button>
                          <button
                            onClick={() => setPending({ type: 'cancel', appt })}
                            className="p-1.5 bg-red-50 text-red-400 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      {/* CONFIRMED: complete or no-show */}
                      {appt.status === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => setPending({ type: 'complete', appt })}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <CheckCheck size={13} /> Mark Complete
                          </button>
                          <button
                            onClick={() => setPending({ type: 'noshow', appt })}
                            title="Mark as no-show"
                            className="p-1.5 bg-neutral-100 text-neutral-400 hover:bg-amber-50 hover:text-amber-500 rounded-lg transition-colors"
                          >
                            <UserX size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {pendingAction && (
        <ConfirmModal
          variant={ACTION_CONFIG[pendingAction.type].variant}
          title={ACTION_CONFIG[pendingAction.type].title(pendingAction.appt)}
          description={ACTION_CONFIG[pendingAction.type].description(pendingAction.appt)}
          confirmLabel={ACTION_CONFIG[pendingAction.type].confirmLabel}
          isPending={isMutating}
          onConfirm={handleConfirm}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  )
}
