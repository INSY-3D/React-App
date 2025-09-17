import { Routes, Route } from 'react-router-dom'
import AppLayout from './app/AppLayout'
import Home from './pages/Home'
import Cards from './pages/Cards'
import Payments from './pages/Payments'
import Profile from './pages/Profile'
import { ProtectedRoute, PublicOnlyRoute } from './routes/guards'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import StaffPortal from './pages/staff/StaffPortal'
import NewPayment from './pages/payments/NewPayment'
import { Error404, SessionTimeout } from './pages/errors/Errors'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/payments/new" element={<NewPayment />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/staff" element={<StaffPortal />} />
        </Route>
      </Route>

      <Route path="/session-timeout" element={<SessionTimeout />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  )
}
