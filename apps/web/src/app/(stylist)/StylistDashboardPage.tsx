import { useAppointments } from '@/hooks/useAppointments'
import { format } from 'date-fns'

export default function StylistDashboardPage() {
  const { data: appointments } = useAppointments()
  const upcoming = appointments?.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING') ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <p className="text-sm text-neutral-500">Upcoming</p>
          <p className="text-3xl font-bold text-brand-500 mt-1">{upcoming.length}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="font-semibold text-neutral-900 mb-4">Today's Appointments</h2>
        {!upcoming.length ? (
          <p className="text-neutral-400 text-sm">No upcoming appointments.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((appt) => (
              <div key={appt.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="font-medium text-neutral-900">{appt.customer.name}</p>
                  <p className="text-sm text-neutral-500">{format(new Date(appt.startsAt), 'PPp')}</p>
                </div>
                <span className="text-sm font-semibold text-brand-500">LKR {Number(appt.totalLKR).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
