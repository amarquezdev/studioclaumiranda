import { useState } from 'react'
import { useAuth } from '../AuthContext'

export default function AdminLogin() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full bg-dark border border-dark-border px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-gold transition-colors"

  return (
    <div className="sage-admin min-h-screen bg-dark flex items-center justify-center px-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-gold text-4xl block mb-3">✂</span>
          <h1 className="text-xl font-light tracking-widest uppercase" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2A2420', letterSpacing: '0.2em' }}>
            Studio Clau Miranda
          </h1>
          <p className="text-xs tracking-wider mt-1 uppercase" style={{ color: '#8A8480' }}>Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-card border border-dark-border rounded-sm p-8 space-y-5">
          <h2 className="font-light text-lg mb-6" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#2A2420', fontSize: '1.4rem' }}>
            Iniciar sesión
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#8A8480' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={inputCls}
              style={{ color: '#2A2420' }}
              placeholder="admin@studioclau.cl"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#8A8480' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={inputCls}
              style={{ color: '#2A2420' }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: '#8A8480' }}>
          ← <a href="/" className="hover:text-gold transition-colors" style={{ color: '#6A6460' }}>Volver al sitio</a>
        </p>
      </div>
    </div>
  )
}
