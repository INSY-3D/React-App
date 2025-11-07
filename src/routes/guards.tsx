import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../store'

export function ProtectedRoute() {
  const isAuthed = useAppSelector((s) => s.auth.isAuthenticated)
  return isAuthed ? <Outlet /> : <Navigate to="/login" replace />
}

export function PublicOnlyRoute() {
  const isAuthed = useAppSelector((s) => s.auth.isAuthenticated)
  const role = useAppSelector((s) => s.auth.user?.role)
  if (!isAuthed) return <Outlet />
  if (role === 'admin') return <Navigate to="/admin" replace />
  if (role === 'staff') return <Navigate to="/staff" replace />
  return <Navigate to="/dashboard" replace />
}

export function AdminRoute() {
  const isAuthed = useAppSelector((s) => s.auth.isAuthenticated)
  const role = useAppSelector((s) => s.auth.user?.role)
  if (!isAuthed) return <Navigate to="/admin-login" replace />
  return role === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />
}

export function StaffOnlyRoute() {
  const isAuthed = useAppSelector((s) => s.auth.isAuthenticated)
  const role = useAppSelector((s) => s.auth.user?.role)
  if (!isAuthed) return <Navigate to="/staff-login" replace />
  if (role === 'staff') return <Outlet />
  if (role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/dashboard" replace />
}


