import { Link, useLocation, useNavigate } from 'react-router-dom'
import { RouteOutlet } from '@/components/ui/RouteOutlet'
import { LayoutDashboard, User, LogOut, CalendarCheck, Star, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/auth'

const navItems = [
  { to: '/stylist/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/stylist/appointments', label: 'Appointments', icon: CalendarCheck },
  { to: '/stylist/reviews',      label: 'My Reviews',   icon: Star },
  { to: '/stylist/income',       label: 'My Income',    icon: TrendingUp },
  { to: '/stylist/profile',      label: 'My Profile',   icon: User },
]

export default function StylistLayout() {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <aside className="w-60 bg-white border-r border-neutral-100 flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-neutral-100">
          <Link to="/" className="font-display text-xl italic text-brand-400">GlowHer</Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname.startsWith(to) && (to !== '/stylist/dashboard' || pathname === to)
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">{user?.name}</p>
              <p className="text-xs text-neutral-400">Stylist</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-neutral-500 hover:bg-neutral-50 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <RouteOutlet />
      </main>
    </div>
  )
}
