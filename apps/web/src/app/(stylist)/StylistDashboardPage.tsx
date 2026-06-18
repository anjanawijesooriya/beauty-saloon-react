import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { format, isToday } from 'date-fns'
import { CalendarCheck, Clock, CheckCircle2, TrendingUp, Star, ArrowRight } from 'lucide-react'
import { useAppointments, useStylistConfirm, useStylistComplete } from '@/hooks/useAppointments'
import { useMyProfile } from '@/hooks/useStylists'
import { useAuthStore } from '@/store/auth'

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-600 border border-amber-100',
  CONFIRMED: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  COMPLETED: 'bg-blue-50 text-blue-600 border border-blue-100',
  CANCELLED: 'bg-red-50 text-red-400 border border-red-100',
  NO_SHOW:   'bg-neutral-100 text-neutral-400 border border-neutral-200',
}

export default function StylistDashboardPage() {
  const { user } = useAuthStore()
  const { data: profile } = useMyProfile()
  const { data: appointments = [], isLoading } = useAppointments()
  const confirm  = useStylistConfirm()
  const complete = useStylistComplete()

  const stats = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const pending   = appointments.filter((a) => a.status === 'PENDING').length
    const todayAppts = appointments.filter((a) => isToday(new Date(a.startsAt)) && a.status !== 'CANCELLED')
    const completed  = appointments.filter((a) => a.status === 'COMPLETED')
    const monthIncome = completed
      .filter((a) => new Date(a.startsAt) >= monthStart)
      .reduce((sum, a) => sum + Number(a.totalLKR), 0)
    const totalIncome = completed.reduce((sum, a) => sum + Number(a.totalLKR), 0)

    return { pending, todayCount: todayAppts.length, monthIncome, totalIncome, todayAppts }
  }, [appointments])

  const upcoming = appointments
    .filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-neutral-400 text-sm mt-1">Here's what's happening with your appointments today.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Appointments", value: stats.todayCount, icon: CalendarCheck, color: 'text-brand-500', bg: 'bg-brand-50' },
          { label: 'Pending Confirmation', value: stats.pending,    icon: Clock,         color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: "This Month's Income",  value: `LKR ${stats.monthIncome.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Rating',               value: profile ? `${profile.rating.toFixed(1)} ★` : '—', icon: Star, color: 'text-gold-500', bg: 'bg-yellow-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl shadow-card p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{isLoading ? '—' : value}</p>
            <p className="text-xs text-neutral-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's schedule */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-neutral-900">Today's Schedule</h2>
            <span className="text-xs text-neutral-400">{format(new Date(), 'EEEE, d MMM')}</span>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-neutral-100 rounded-xl animate-pulse" />)}</div>
          ) : stats.todayAppts.length === 0 ? (
            <div className="text-center py-8 text-neutral-300">
              <CalendarCheck size={32} className="mx-auto mb-2" />
              <p className="text-sm">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.todayAppts.map((appt) => (
                <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50">
                  <div className="text-center w-12 flex-shrink-0">
                    <p className="text-xs text-neutral-400">{format(new Date(appt.startsAt), 'h:mm')}</p>
                    <p className="text-xs text-neutral-400">{format(new Date(appt.startsAt), 'a')}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{appt.customer.name}</p>
                    <p className="text-xs text-neutral-400 truncate">
                      {appt.items.map((i) => i.service.name).join(', ')}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[appt.status]}`}>
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming — needs action */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-neutral-900">Needs Your Action</h2>
            <Link to="/stylist/appointments" className="text-xs text-brand-400 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-neutral-100 rounded-xl animate-pulse" />)}</div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-8 text-neutral-300">
              <CheckCircle2 size={32} className="mx-auto mb-2" />
              <p className="text-sm">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((appt) => (
                <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 hover:border-brand-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">{appt.customer.name}</p>
                    <p className="text-xs text-neutral-400">{format(new Date(appt.startsAt), 'd MMM · h:mm a')}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {appt.status === 'PENDING' && (
                      <button
                        onClick={() => confirm.mutate(appt.id)}
                        disabled={confirm.isPending}
                        className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Confirm
                      </button>
                    )}
                    {appt.status === 'CONFIRMED' && (
                      <button
                        onClick={() => complete.mutate(appt.id)}
                        disabled={complete.isPending}
                        className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { to: '/stylist/appointments', label: 'Manage Appointments', icon: CalendarCheck, desc: 'Confirm & complete bookings' },
          { to: '/stylist/reviews',      label: 'My Reviews',          icon: Star,         desc: 'See what clients say' },
          { to: '/stylist/income',       label: 'My Income',           icon: TrendingUp,   desc: `Total: LKR ${stats.totalIncome.toLocaleString()}` },
        ].map(({ to, label, icon: Icon, desc }) => (
          <Link key={to} to={to} className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow group">
            <Icon size={22} className="text-brand-400 mb-3" />
            <p className="font-semibold text-neutral-900 text-sm group-hover:text-brand-500 transition-colors">{label}</p>
            <p className="text-xs text-neutral-400 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
