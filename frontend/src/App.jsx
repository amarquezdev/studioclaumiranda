import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicSite from './PublicSite'

const AdminApp = lazy(() => import('./admin/AdminApp'))

const AdminFallback = (
  <div className="min-h-screen bg-dark flex items-center justify-center">
    <div className="text-gold text-sm tracking-widest animate-pulse">Cargando...</div>
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={<Suspense fallback={AdminFallback}><AdminApp /></Suspense>}
      />
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  )
}
