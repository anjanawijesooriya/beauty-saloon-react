import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

interface Props {
  roles?: Array<'CUSTOMER' | 'STYLIST' | 'ADMIN'>
}

export default function ProtectedRoute({ roles }: Props) {
  const { user, token } = useAuthStore()

  if (!token || !user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />

  return <Outlet />
}
