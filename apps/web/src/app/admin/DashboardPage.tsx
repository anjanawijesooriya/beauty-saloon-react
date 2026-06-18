import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Users, Calendar, TrendingUp, Scissors, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { Appointment } from '@/types'

interface AdminStats {
  total: number
  pending: number
  confirmed: number
  cancelled: number
  completed: number
  revenueLKR: number
  userCount: number
  activeStylistCount: number
  recent: Appointment[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:   { label: 'Pending',   color: 'bg-amber-50 text-amber-600 border-amber-100',   icon: <Clock size={11} /> },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-50 text-blue-600 border-blue-100',       icon: <AlertCircle size={11} /> },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={11} /> },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-500 border-red-100',           icon: <XCircle size={11} /> },
  NO_SHOW:   { label: 'No Show',   color: 'bg-neutral-100 text-neutral-500 border-neutral-200', icon: <XCircle size={11} /> },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function KpiCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.FC<any>; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">{label}</span>
        <div className="w-9 h-9 gradient-brand rounded-xl flex items-center justify-center">
          <Icon size={17} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

function StatusBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-neutral-500">{label}</span>
        <span className="text-xs font-semibold text-neutral-700">{count} <span className="text-neutral-400 font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/appointments/admin/stats').then((r) => r.data),
  })

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-neutral-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  const s = stats!

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Dashboard</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Bookings"  value={s.total}                              icon={Calendar} sub={`${s.pending} pending`} />
        <KpiCard label="Revenue (LKR)"   value={`LKR ${s.revenueLKR.toLocaleString()}`} icon={TrendingUp} sub="from completed appts" />
        <KpiCard label="Total Users"     value={s.userCount}                          icon={Users}    sub="registered accounts" />
        <KpiCard label="Active Stylists" value={s.activeStylistCount}                 icon={Scissors} sub="available now" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent appointments table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900">Recent Appointments</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Latest 10 bookings across all stylists</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-50">
                  <th className="text-left text-xs font-medium text-neutral-400 px-6 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Stylist</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Date</th>
                  <th className="text-right text-xs font-medium text-neutral-400 px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {s.recent.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-sm text-neutral-400">No appointments yet</td></tr>
                ) : s.recent.map((appt) => (
                  <tr key={appt.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="text-sm font-medium text-neutral-800">{appt.customer.name}</p>
                      <p className="text-xs text-neutral-400">{appt.customer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">{appt.stylist.user.name}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-neutral-700">{format(new Date(appt.startsAt), 'd MMM yyyy')}</p>
                      <p className="text-xs text-neutral-400">{format(new Date(appt.startsAt), 'h:mm a')}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-neutral-800">
                      LKR {Number(appt.totalLKR).toLocaleString()}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={appt.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="font-semibold text-neutral-900 mb-1">Booking Breakdown</h2>
          <p className="text-xs text-neutral-400 mb-5">All {s.total} appointments by status</p>
          <div className="space-y-4">
            <StatusBar label="Completed" count={s.completed} total={s.total} color="bg-emerald-400" />
            <StatusBar label="Confirmed" count={s.confirmed} total={s.total} color="bg-blue-400" />
            <StatusBar label="Pending"   count={s.pending}   total={s.total} color="bg-amber-400" />
            <StatusBar label="Cancelled" count={s.cancelled} total={s.total} color="bg-red-400" />
          </div>

          <div className="mt-6 pt-5 border-t border-neutral-100 grid grid-cols-2 gap-3">
            {[
              { label: 'Completed', val: s.completed, color: 'text-emerald-500' },
              { label: 'Confirmed', val: s.confirmed, color: 'text-blue-500' },
              { label: 'Pending',   val: s.pending,   color: 'text-amber-500' },
              { label: 'Cancelled', val: s.cancelled, color: 'text-red-500' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center p-3 bg-neutral-50 rounded-xl">
                <p className={`text-xl font-bold ${color}`}>{val}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
