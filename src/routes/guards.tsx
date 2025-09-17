import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../store'

export function ProtectedRoute() {
  const isAuthed = useAppSelector((s) => s.auth.isAuthenticated)
  return isAuthed ? <Outlet /> : <Navigate to="/login" replace />
}

export function PublicOnlyRoute() {
  const isAuthed = useAppSelector((s) => s.auth.isAuthenticated)
  return isAuthed ? <Navigate to="/dashboard" replace /> : <Outlet />
}


