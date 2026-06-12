import { useState } from 'react'
import { useAuth } from '../AuthContext'

export default function AdminLogin() {
  const { login } = useAuth()
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={inputCls + ' pr-10'}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
