import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import AdminLogin from './components/AdminLogin'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Dashboard'
import Services from './pages/Services'
import BusinessHours from './pages/BusinessHours'
import Appointments from './pages/Appointments'
import Users from './pages/Users'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-gold text-sm tracking-widest animate-pulse">Cargando...</div>
    </div>
  )
  return user ? children : <Navigate to="/admin" replace />
}

function AdminRoutes() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-gold text-sm tracking-widest animate-pulse">Cargando...</div>
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} />
      <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route path="dashboard"    element={<Dashboard />} />
        <Route path="services"     element={<Services />} />
        <Route path="hours"        element={<BusinessHours />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="users"        element={<Users />} />
      </Route>
    </Routes>
  )
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <AdminRoutes />
    </AuthProvider>
  )
}
