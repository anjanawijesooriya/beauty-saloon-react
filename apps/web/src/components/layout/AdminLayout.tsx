import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Scissors, Calendar, Settings, ShoppingBag } from 'lucide-react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/services', label: 'Services', icon: Scissors },
  { to: '/admin/stylists', label: 'Stylists', icon: Users },
  { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { to: '/admin/products', label: 'Products', icon: ShoppingBag },
]

export default function AdminLayout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950">
      <aside className="w-64 bg-brand-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6">
          <span className="font-display text-xl italic text-brand-300">GlowHer Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === to ? 'bg-brand-700 text-white' : 'text-brand-200 hover:bg-brand-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 flex items-center px-6">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">Admin Panel</h1>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
