import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { TrendingUp, CheckCircle2, Calendar, DollarSign } from 'lucide-react'
import { useAppointments } from '@/hooks/useAppointments'

export default function StylistIncomePage() {
  const { data: appointments = [], isLoading } = useAppointments()

  const completed = appointments.filter((a) => a.status === 'COMPLETED')

  const { monthlyBreakdown, thisMonth, lastMonth, totalIncome, totalCompleted } = useMemo(() => {
    const now = new Date()
    const thisMonthRange = { start: startOfMonth(now), end: endOfMonth(now) }
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthRange = { start: startOfMonth(lastMonthDate), end: endOfMonth(lastMonthDate) }

    const thisMonth = completed
      .filter((a) => isWithinInterval(new Date(a.startsAt), thisMonthRange))
      .reduce((s, a) => s + Number(a.totalLKR), 0)

    const lastMonth = completed
      .filter((a) => isWithinInterval(new Date(a.startsAt), lastMonthRange))
      .reduce((s, a) => s + Number(a.totalLKR), 0)

    const totalIncome = completed.reduce((s, a) => s + Number(a.totalLKR), 0)

    // Group by month (last 6 months)
    const monthMap: Record<string, { label: string; income: number; count: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = format(d, 'yyyy-MM')
      monthMap[key] = { label: format(d, 'MMM yyyy'), income: 0, count: 0 }
    }
    completed.forEach((a) => {
      const key = format(new Date(a.startsAt), 'yyyy-MM')
      if (monthMap[key]) {
        monthMap[key].income += Number(a.totalLKR)
        monthMap[key].count += 1
      }
    })

    const monthlyBreakdown = Object.values(monthMap)
    const maxIncome = Math.max(...monthlyBreakdown.map((m) => m.income), 1)

    return { monthlyBreakdown, thisMonth, lastMonth, totalIncome, totalCompleted: completed.length, maxIncome }
  }, [completed])

  const maxIncome = Math.max(...monthlyBreakdown.map((m) => m.income), 1)
  const growth = lastMonth > 0 ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(1) : null

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-neutral-100 rounded-2xl" />)}
        </div>
        <div className="h-56 bg-neutral-100 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Income</h1>
        <p className="text-neutral-400 text-sm mt-0.5">Earnings from completed appointments</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center mb-3">
            <TrendingUp size={18} className="text-brand-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">LKR {thisMonth.toLocaleString()}</p>
          <p className="text-xs text-neutral-400 mt-1">This month</p>
          {growth !== null && (
            <p className={`text-xs mt-1 font-medium ${Number(growth) >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
              {Number(growth) >= 0 ? '↑' : '↓'} {Math.abs(Number(growth))}% vs last month
            </p>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <DollarSign size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">LKR {totalIncome.toLocaleString()}</p>
          <p className="text-xs text-neutral-400 mt-1">Total earned (all time)</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <CheckCircle2 size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900">{totalCompleted}</p>
          <p className="text-xs text-neutral-400 mt-1">Completed appointments</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="font-semibold text-neutral-900 mb-6">Monthly Earnings (Last 6 Months)</h2>
        <div className="flex items-end gap-3 h-40">
          {monthlyBreakdown.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium">
                {m.income > 0 ? `${(m.income / 1000).toFixed(0)}k` : ''}
              </span>
              <div className="w-full flex items-end" style={{ height: '88px' }}>
                <div
                  className="w-full rounded-t-lg gradient-brand transition-all duration-500"
                  style={{ height: `${Math.max((m.income / maxIncome) * 88, m.income > 0 ? 4 : 0)}px` }}
                />
              </div>
              <span className="text-xs text-neutral-400 text-center leading-tight">{m.label.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent completed appointments */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="font-semibold text-neutral-900 mb-4">Recent Completed Appointments</h2>
        {completed.length === 0 ? (
          <div className="text-center py-8 text-neutral-300">
            <Calendar size={32} className="mx-auto mb-2" />
            <p className="text-sm">No completed appointments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {completed
              .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
              .slice(0, 10)
              .map((appt) => (
                <div key={appt.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{appt.customer.name}</p>
                    <p className="text-xs text-neutral-400">
                      {format(new Date(appt.startsAt), 'd MMM yyyy')} ·{' '}
                      {appt.items.map((i) => i.service.name).join(', ')}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    + LKR {Number(appt.totalLKR).toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
