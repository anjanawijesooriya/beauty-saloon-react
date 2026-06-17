import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import CustomerLayout from './components/layout/CustomerLayout'
import AdminLayout from './components/layout/AdminLayout'
import StylistLayout from './components/layout/StylistLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useAuthStore } from './store/auth'

// Public / customer
const HomePage             = lazy(() => import('./app/home/HomePage'))
const LoginPage            = lazy(() => import('./app/(auth)/LoginPage'))
const RegisterPage         = lazy(() => import('./app/(auth)/RegisterPage'))
const ServicesPage         = lazy(() => import('./app/(customer)/ServicesPage'))
const ServiceDetailPage    = lazy(() => import('./app/(customer)/ServiceDetailPage'))
const StylistsPage         = lazy(() => import('./app/(customer)/StylistsPage'))
const StylistDetailPage    = lazy(() => import('./app/(customer)/StylistDetailPage'))
const BookPage             = lazy(() => import('./app/(customer)/BookPage'))
const ProfilePage          = lazy(() => import('./app/(customer)/ProfilePage'))
const AppointmentsPage     = lazy(() => import('./app/(customer)/AppointmentsPage'))
const BookingSuccessPage   = lazy(() => import('./app/(customer)/BookingSuccessPage'))

// Stylist portal
const StylistDashboard     = lazy(() => import('./app/(stylist)/StylistDashboardPage'))
const StylistProfilePage   = lazy(() => import('./app/(stylist)/StylistProfilePage'))

// Admin
const AdminDashboard       = lazy(() => import('./app/admin/DashboardPage'))
const AdminServicesPage    = lazy(() => import('./app/admin/ServicesPage'))
const AdminStylistsPage    = lazy(() => import('./app/admin/StylistsPage'))

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen gradient-hero">
      <div className="text-center">
        <p className="font-display text-4xl italic text-brand-400 mb-6">GlowHer</p>
        <div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )
}

export default function App() {
  const { initialize, initialized } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!initialized) return <Spinner />

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* Auth pages — no layout */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer-facing */}
          <Route element={<CustomerLayout />}>
            <Route path="/"                element={<HomePage />} />
            <Route path="/services"        element={<ServicesPage />} />
            <Route path="/services/:id"    element={<ServiceDetailPage />} />
            <Route path="/stylists"        element={<StylistsPage />} />
            <Route path="/stylists/:id"    element={<StylistDetailPage />} />

            <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
              <Route path="/book"             element={<BookPage />} />
              <Route path="/booking/success"  element={<BookingSuccessPage />} />
              <Route path="/profile"          element={<ProfilePage />} />
              <Route path="/appointments"     element={<AppointmentsPage />} />
            </Route>
          </Route>

          {/* Stylist portal */}
          <Route element={<ProtectedRoute roles={['STYLIST']} />}>
            <Route element={<StylistLayout />}>
              <Route path="/stylist/dashboard"  element={<StylistDashboard />} />
              <Route path="/stylist/profile"    element={<StylistProfilePage />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin"           element={<AdminDashboard />} />
              <Route path="/admin/services"  element={<AdminServicesPage />} />
              <Route path="/admin/stylists"  element={<AdminStylistsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}
