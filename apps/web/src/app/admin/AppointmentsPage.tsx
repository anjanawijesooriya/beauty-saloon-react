import { useState } from 'react'
import { format } from 'date-fns'
import { Clock } from 'lucide-react'
import { useAdminAppointments } from '@/hooks/useAppointments'
import type { AppointmentStatus } from '@/types'

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING:   'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW:   'No Show',
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING:   'bg-yellow-50 text-yellow-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
  NO_SHOW:   'bg-neutral-100 text-neutral-500',
}

const ALL = 'ALL' as const
type Filter = AppointmentStatus | typeof ALL

export default function AdminAppointmentsPage() {
  const { data: appointments = [], isLoading } = useAdminAppointments()
  const [filter, setFilter] = useState<Filter>(ALL)

  const statuses: Filter[] = [ALL, 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

  const visible = filter === ALL ? appointments : appointments.filter((a) => a.status === filter)

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-neutral-100 rounded-xl" />)}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-neutral-900">Appointments</h1>
        <span className="text-sm text-neutral-400">{appointments.length} total</span>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-pill text-sm font-medium transition-colors ${
              filter === s
                ? 'gradient-brand text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {s === ALL ? 'All' : STATUS_LABELS[s as AppointmentStatus]}
            {s !== ALL && (
              <span className="ml-1.5 opacity-70">
                ({appointments.filter((a) => a.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p>No appointments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Stylist</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Date & Time</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Services</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500">Total</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {visible.map((appt) => (
                <tr key={appt.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{appt.customer.name}</p>
                    <p className="text-neutral-400 text-xs">{appt.customer.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-700">{appt.stylist?.user?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                    {format(new Date(appt.startsAt), 'd MMM yyyy')}<br />
                    <span className="text-xs text-neutral-400">{format(new Date(appt.startsAt), 'h:mm a')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {appt.items.map((item) => (
                        <span key={item.id} className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">
                          {item.service.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-neutral-800">
                    LKR {Number(appt.totalLKR).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[appt.status]}`}>
                      {STATUS_LABELS[appt.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
