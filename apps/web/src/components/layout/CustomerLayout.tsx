import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { Moon, Sun, User, LogOut } from 'lucide-react'

export default function CustomerLayout() {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
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
            {user && <Link to="/appointments" className="text-neutral-600 hover:text-brand-400 transition-colors">My Bookings</Link>}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-brand-50 transition-colors">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="p-2 rounded-full hover:bg-brand-50"><User size={18} /></Link>
                <button onClick={handleLogout} className="p-2 rounded-full hover:bg-brand-50"><LogOut size={18} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
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
