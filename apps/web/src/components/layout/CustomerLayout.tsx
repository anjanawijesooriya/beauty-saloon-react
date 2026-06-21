import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RouteOutlet } from '@/components/ui/RouteOutlet'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { useCartStore } from '@/store/cart'
import { Moon, Sun, LogOut, ShoppingBag, CalendarCheck, Menu, X } from 'lucide-react'

export default function CustomerLayout() {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const cartCount = useCartStore((s) => s.totalItems())
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMobileOpen(false)
  }

  const close = () => setMobileOpen(false)

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <header className="sticky top-0 z-50 glass border-b border-brand-100 dark:border-brand-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl italic text-brand-400">GlowHer</Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/services"     className="text-neutral-600 hover:text-brand-400 transition-colors">Services</Link>
            <Link to="/stylists"     className="text-neutral-600 hover:text-brand-400 transition-colors">Stylists</Link>
            <Link to="/shop"         className="text-neutral-600 hover:text-brand-400 transition-colors">Shop</Link>
            {user && (
              <>
                <Link to="/appointments" className="text-neutral-600 hover:text-brand-400 transition-colors">My Bookings</Link>
                <Link to="/orders"       className="text-neutral-600 hover:text-brand-400 transition-colors">Orders</Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-brand-50 transition-colors">
              {theme === 'light'
                ? <Moon size={18} className="text-neutral-600" />
                : <Sun size={18} className="text-yellow-400" />}
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-brand-50 transition-colors">
              <ShoppingBag size={18} className="text-neutral-600" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white gradient-brand rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Desktop: user actions */}
            {user ? (
              <div className="hidden md:flex items-center gap-1">
                <Link to="/book" title="Book Appointment" className="p-2 rounded-full hover:bg-brand-50 transition-colors">
                  <CalendarCheck size={18} className="text-neutral-600" />
                </Link>
                <Link to="/profile" title="My Profile" className="rounded-full hover:opacity-90 transition-opacity">
                  {user.avatarUrl
                    ? <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-100" />
                    : <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">{user.name[0].toUpperCase()}</div>
                  }
                </Link>
                <button onClick={handleLogout} title="Logout" className="p-2 rounded-full hover:bg-brand-50">
                  <LogOut size={18} className="text-neutral-600" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex gap-2 ml-1">
                <Link to="/login"    className="px-4 py-2 text-sm font-medium text-brand-400 border border-brand-400 rounded-pill hover:bg-brand-50 transition-colors">Login</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white gradient-brand rounded-pill hover:opacity-90 transition-opacity">Sign Up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-full hover:bg-brand-50 transition-colors ml-1"
              aria-label="Toggle menu"
            >
              {mobileOpen
                ? <X size={20} className="text-neutral-700 dark:text-neutral-200" />
                : <Menu size={20} className="text-neutral-700 dark:text-neutral-200" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 top-16">
          <div className="absolute inset-0 bg-black/20 dark:bg-black/50" onClick={close} />
          <div className="relative bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 shadow-xl">
            <nav className="px-4 py-3 space-y-1">
              {[
                { to: '/services',     label: 'Services' },
                { to: '/stylists',     label: 'Stylists' },
                { to: '/shop',         label: 'Shop' },
                ...(user ? [
                  { to: '/appointments', label: 'My Bookings' },
                  { to: '/orders',       label: 'My Orders' },
                  { to: '/profile',      label: 'My Profile' },
                  { to: '/book',         label: 'Book Appointment' },
                ] : []),
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={close}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-brand-50 dark:hover:bg-neutral-800 hover:text-brand-500 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl
                      ? <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-100" />
                      : <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold">{user.name[0].toUpperCase()}</div>
                    }
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-neutral-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login"    onClick={close} className="flex-1 py-2.5 text-center text-sm font-medium text-brand-400 border border-brand-400 rounded-xl hover:bg-brand-50 transition-colors">Login</Link>
                  <Link to="/register" onClick={close} className="flex-1 py-2.5 text-center text-sm font-medium text-white gradient-brand rounded-xl hover:opacity-90 transition-opacity">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="min-h-[calc(100vh-4rem)]">
        <RouteOutlet />
      </main>

      <footer className="bg-brand-900 text-brand-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p className="font-display text-xl italic text-white mb-2">GlowHer</p>
          <p>Sri Lanka's Premier Beauty Platform · © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
