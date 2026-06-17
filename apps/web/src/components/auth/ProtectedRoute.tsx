import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

interface Props {
  roles?: Array<'CUSTOMER' | 'STYLIST' | 'ADMIN'>
}

export default function ProtectedRoute({ roles }: Props) {
  const { user, token, initialized } = useAuthStore()
  const location = useLocation()

  if (!initialized) return null

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
