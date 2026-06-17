import { format } from 'date-fns'
import { useAppointments, useCancelAppointment } from '@/hooks/useAppointments'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  NO_SHOW: 'bg-neutral-100 text-neutral-600',
}

export default function AppointmentsPage() {
  const { data: appointments, isLoading } = useAppointments()
  const { mutate: cancel } = useCancelAppointment()

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full" /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl italic text-neutral-900 mb-8">My Appointments</h1>
      {!appointments?.length ? (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-lg">No appointments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-neutral-900">{appt.stylist.user.name}</p>
                  <p className="text-neutral-500 text-sm">{format(new Date(appt.startsAt), 'PPp')}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {appt.items.map((item) => (
                      <span key={item.id} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-pill">{item.service.name}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-pill ${statusColors[appt.status]}`}>{appt.status}</span>
                  <span className="font-semibold text-brand-500">LKR {Number(appt.totalLKR).toLocaleString()}</span>
                  {appt.status === 'PENDING' && (
                    <button onClick={() => cancel({ id: appt.id })} className="text-xs text-red-500 hover:underline">Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
