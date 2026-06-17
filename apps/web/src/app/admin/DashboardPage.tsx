import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Users, Calendar, TrendingUp, Scissors } from 'lucide-react'

export default function AdminDashboard() {
  const { data: appointments } = useQuery({ queryKey: ['admin-appointments'], queryFn: () => api.get('/appointments').then(r => r.data) })
  const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: () => api.get('/users').then(r => r.data) })

  const stats = [
    { label: 'Total Bookings', value: appointments?.length ?? '—', icon: Calendar, color: 'brand' },
    { label: 'Total Users', value: users?.total ?? '—', icon: Users, color: 'gold' },
    { label: 'Active Stylists', value: '—', icon: Scissors, color: 'brand' },
    { label: 'Revenue (LKR)', value: '—', icon: TrendingUp, color: 'gold' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-500">{label}</span>
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                <Icon size={16} className="text-brand-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="font-semibold text-neutral-900 mb-4">Recent Appointments</h2>
        <p className="text-neutral-400 text-sm">Charts and tables will appear here.</p>
      </div>
    </div>
  )
}
