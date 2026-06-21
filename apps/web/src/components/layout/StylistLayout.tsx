import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { RouteOutlet } from '@/components/ui/RouteOutlet'
import { LayoutDashboard, User, LogOut, CalendarCheck, Star, TrendingUp, Menu, X } from 'lucide-react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 w-60 bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 flex flex-col',
          'transform transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:relative md:translate-x-0 md:z-auto',
        ].join(' ')}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
          <Link to="/stylist/dashboard" className="font-display text-xl italic text-brand-400">GlowHer</Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} className="text-neutral-600 dark:text-neutral-400" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname.startsWith(to) && (to !== '/stylist/dashboard' || pathname === to)
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full gradient-brand flex items-center justify-center text-white text-sm font-bold">{user?.name?.[0]?.toUpperCase()}</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-neutral-400">Stylist</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden h-14 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 flex items-center px-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors mr-3"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-neutral-600 dark:text-neutral-400" />
          </button>
          <span className="font-display text-lg italic text-brand-400">GlowHer</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <RouteOutlet />
        </main>
      </div>
    </div>
  )
}
