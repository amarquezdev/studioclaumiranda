import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, getMe } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { setLoading(false); return }
    getMe()
      .then(r => setUser(r.data))
      .catch(() => localStorage.removeItem('admin_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const r = await apiLogin(email, password)
    localStorage.setItem('admin_token', r.data.access_token)
    const me = await getMe()
    if (me.data.role !== 'admin') {
      localStorage.removeItem('admin_token')
      throw new Error('No tienes permisos de administrador')
    }
    setUser(me.data)
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
