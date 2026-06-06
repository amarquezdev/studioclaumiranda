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

  const inputCls = "w-full bg-input border border-border px-3 py-2.5 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors text-foreground"

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-primary text-4xl block mb-3">✂</span>
          <h1 className="text-xl font-light tracking-widest uppercase text-foreground" style={{ letterSpacing: '0.2em' }}>
            Studio Clau Miranda
          </h1>
          <p className="text-xs tracking-wider mt-1 uppercase text-muted-foreground">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-sm p-8 space-y-5">
          <h2 className="font-light mb-6 text-foreground" style={{ fontSize: '1.4rem' }}>
            Iniciar sesión
          </h2>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-3 py-2 rounded-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={inputCls}
              placeholder="admin@studioclau.cl"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-2 text-muted-foreground">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={inputCls}
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

        <p className="text-center text-xs mt-6 text-muted-foreground">
          ← <a href="/" className="hover:text-primary transition-colors">Volver al sitio</a>
        </p>
      </div>
    </div>
  )
}
