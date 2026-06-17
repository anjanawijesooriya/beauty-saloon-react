import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, User, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth'

const navItems = [
  { to: '/stylist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/stylist/profile',   label: 'My Profile', icon: User },
]

export default function StylistLayout() {
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <aside className="w-56 bg-white border-r border-neutral-200 flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-neutral-100">
          <Link to="/" className="font-display text-xl italic text-brand-400">GlowHer</Link>
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
        <div className="p-3 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold">
              {user?.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">{user?.name}</p>
              <p className="text-xs text-neutral-400">Stylist</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
