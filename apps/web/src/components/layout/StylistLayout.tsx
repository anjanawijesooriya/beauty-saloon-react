import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calendar, User } from 'lucide-react'

const navItems = [
  { to: '/stylist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/stylist/calendar', label: 'Calendar', icon: Calendar },
  { to: '/stylist/profile', label: 'My Profile', icon: User },
]

export default function StylistLayout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <aside className="w-56 bg-white border-r border-neutral-200 flex flex-col">
        <div className="h-16 flex items-center px-5">
          <span className="font-display text-xl italic text-brand-400">GlowHer</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === to ? 'bg-brand-50 text-brand-600' : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
