import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { useCartStore } from '@/store/cart'
import { Moon, Sun, User, LogOut, ShoppingBag, CalendarCheck } from 'lucide-react'

export default function CustomerLayout() {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const cartCount = useCartStore((s) => s.totalItems())
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <header className="sticky top-0 z-50 glass border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl italic text-brand-400">GlowHer</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/services" className="text-neutral-600 hover:text-brand-400 transition-colors">Services</Link>
            <Link to="/stylists" className="text-neutral-600 hover:text-brand-400 transition-colors">Stylists</Link>
            <Link to="/shop" className="text-neutral-600 hover:text-brand-400 transition-colors">Shop</Link>
            {user && (
              <>
                <Link to="/appointments" className="text-neutral-600 hover:text-brand-400 transition-colors">My Bookings</Link>
                <Link to="/orders" className="text-neutral-600 hover:text-brand-400 transition-colors">Orders</Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-brand-50 transition-colors">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {/* Cart icon — always visible */}
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-brand-50 transition-colors">
              <ShoppingBag size={18} className="text-neutral-600" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white gradient-brand rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-1">
                <Link to="/book" title="Book Appointment" className="p-2 rounded-full hover:bg-brand-50 transition-colors">
                  <CalendarCheck size={18} className="text-neutral-600" />
                </Link>
                <Link to="/profile" title="My Profile" className="p-2 rounded-full hover:bg-brand-50">
                  <User size={18} className="text-neutral-600" />
                </Link>
                <button onClick={handleLogout} title="Logout" className="p-2 rounded-full hover:bg-brand-50">
                  <LogOut size={18} className="text-neutral-600" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2 ml-1">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-brand-400 border border-brand-400 rounded-pill hover:bg-brand-50 transition-colors">Login</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium text-white gradient-brand rounded-pill hover:opacity-90 transition-opacity">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="bg-brand-900 text-brand-100 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p className="font-display text-xl italic text-white mb-2">GlowHer</p>
          <p>Sri Lanka's Premier Beauty Platform · © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
