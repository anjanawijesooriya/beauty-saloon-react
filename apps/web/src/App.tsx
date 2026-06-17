import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import CustomerLayout from './components/layout/CustomerLayout'
import AdminLayout from './components/layout/AdminLayout'
import StylistLayout from './components/layout/StylistLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useAuthStore } from './store/auth'

const HomePage = lazy(() => import('./app/home/HomePage'))
const LoginPage = lazy(() => import('./app/(auth)/LoginPage'))
const RegisterPage = lazy(() => import('./app/(auth)/RegisterPage'))
const ServicesPage = lazy(() => import('./app/(customer)/ServicesPage'))
const StylistsPage = lazy(() => import('./app/(customer)/StylistsPage'))
const BookPage = lazy(() => import('./app/(customer)/BookPage'))
const ProfilePage = lazy(() => import('./app/(customer)/ProfilePage'))
const AppointmentsPage = lazy(() => import('./app/(customer)/AppointmentsPage'))
const AdminDashboard = lazy(() => import('./app/admin/DashboardPage'))
const StylistDashboard = lazy(() => import('./app/(stylist)/StylistDashboardPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer-facing (public + protected) */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/stylists" element={<StylistsPage />} />
            <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
              <Route path="/book" element={<BookPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
            </Route>
          </Route>

          {/* Stylist portal */}
          <Route element={<ProtectedRoute roles={['STYLIST']} />}>
            <Route element={<StylistLayout />}>
              <Route path="/stylist/dashboard" element={<StylistDashboard />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}
