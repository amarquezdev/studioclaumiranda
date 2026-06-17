import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import AdminLogin from './components/AdminLogin'
import AdminLayout from './components/AdminLayout'

const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Services      = lazy(() => import('./pages/Services'))
const BusinessHours = lazy(() => import('./pages/BusinessHours'))
const Appointments  = lazy(() => import('./pages/Appointments'))
const Users         = lazy(() => import('./pages/Users'))

const PageFallback = (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-gold text-sm tracking-widest animate-pulse">Cargando...</div>
  </div>
)

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
        <Route path="dashboard"    element={<Suspense fallback={PageFallback}><Dashboard /></Suspense>} />
        <Route path="services"     element={<Suspense fallback={PageFallback}><Services /></Suspense>} />
        <Route path="hours"        element={<Suspense fallback={PageFallback}><BusinessHours /></Suspense>} />
        <Route path="appointments" element={<Suspense fallback={PageFallback}><Appointments /></Suspense>} />
        <Route path="users"        element={<Suspense fallback={PageFallback}><Users /></Suspense>} />
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
