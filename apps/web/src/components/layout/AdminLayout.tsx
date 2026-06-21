import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { RouteOutlet } from '@/components/ui/RouteOutlet'
import {
  LayoutDashboard, Users, UserCog, Scissors, Calendar,
  ShoppingBag, Package, Tag, Star, Trophy, LogOut, Menu, X,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'

const navItems = [
  { to: '/admin',              label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/admin/users',        label: 'Customers',    icon: UserCog },
  { to: '/admin/services',     label: 'Services',     icon: Scissors },
  { to: '/admin/stylists',     label: 'Stylists',     icon: Users },
  { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { to: '/admin/products',     label: 'Products',     icon: ShoppingBag },
  { to: '/admin/orders',       label: 'Orders',       icon: Package },
  { to: '/admin/promotions',   label: 'Promotions',   icon: Tag },
  { to: '/admin/reviews',      label: 'Reviews',      icon: Star },
  { to: '/admin/loyalty',      label: 'Loyalty',      icon: Trophy },
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const { pathname } = useLocation()
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
          'fixed inset-y-0 left-0 z-30 w-64 bg-brand-900 text-white flex flex-col',
          'transform transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:relative md:translate-x-0 md:z-auto',
        ].join(' ')}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-brand-800 flex-shrink-0">
          <span className="font-display text-xl italic text-brand-300">GlowHer Admin</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-brand-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                (to === '/admin' ? pathname === to : pathname.startsWith(to))
                  ? 'bg-brand-700 text-white'
                  : 'text-brand-200 hover:bg-brand-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-brand-800 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-brand-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-300 hover:bg-brand-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} className="text-neutral-600 dark:text-neutral-300" />
            </button>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">Admin Panel</h1>
          </div>
          <span className="text-sm text-neutral-500 dark:text-neutral-400 hidden sm:block">
            Logged in as{' '}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">{user?.name}</span>
          </span>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <RouteOutlet />
        </main>
      </div>
    </div>
  )
}
