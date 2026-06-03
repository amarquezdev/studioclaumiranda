import { Routes, Route } from 'react-router-dom'
import AdminApp from './admin/AdminApp'
import PublicSite from './PublicSite'

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  )
}
