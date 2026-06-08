import { useEffect, useState } from 'react'
import { adminGetUsers, adminUpdateUser, adminDeleteUser, adminRegisterUser } from '../../api/client'
import ConfirmModal from '../components/ConfirmModal'
import FormModal from '../components/FormModal'
import { useAuth } from '../AuthContext'

const FIELDS = [
  { name: 'name',     label: 'Nombre',     required: true,  placeholder: 'Juan Pérez' },
  { name: 'email',    label: 'Email',      type: 'email',   required: true, placeholder: 'juan@email.com' },
  { name: 'phone',    label: 'Teléfono',   placeholder: '+56 9 1234 5678' },
  { name: 'password', label: 'Contraseña', type: 'password', required: true, placeholder: 'Mínimo 8 caracteres' },
  { name: 'role',     label: 'Rol',        type: 'select', required: true,
    options: [{ value: 'client', label: 'Cliente' }, { value: 'admin', label: 'Administrador' }] },
]
const EMPTY = { name: '', email: '', phone: '', password: '', role: 'client' }

export default function Users() {
  const { user: me }          = useAuth()
  const [users, setUsers]     = useState([])
  const [confirm, setConfirm] = useState(null)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const load = () => adminGetUsers().then(r => setUsers(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setError(''); setModal(true) }
  const handleChange = (name, value) => setForm(f => ({ ...f, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const res = await adminRegisterUser({ name: form.name, email: form.email, phone: form.phone || null, password: form.password })
      if (form.role === 'admin') await adminUpdateUser(res.data.id, { role: 'admin' })
      setModal(false); load()
    } catch (err) { setError(err.response?.data?.detail || 'Error al crear usuario') }
    finally { setSaving(false) }
  }

  const handleRoleToggle = async (u) => {
    await adminUpdateUser(u.id, { role: u.role === 'admin' ? 'client' : 'admin' }).catch(() => {})
    load()
  }

  const handleDelete = async () => {
    await adminDeleteUser(confirm).catch(() => {})
    setConfirm(null); load()
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-foreground">Usuarios</h1>
          <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mt-1">{users.length} usuarios registrados</p>
        </div>
        <button onClick={openCreate} className="btn-gold self-start sm:self-auto">+ Nuevo usuario</button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Usuario', 'Email', 'Teléfono', 'Rol', 'Registro', 'Acciones'].map(h => (
                <th key={h} className="text-left text-muted-foreground text-xs uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-border/50 hover:bg-foreground/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <span className="text-foreground">{u.name}</span>
                    {u.id === me?.id && <span className="text-xs text-primary/60">(tú)</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{u.email}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{u.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => u.id !== me?.id && handleRoleToggle(u)} disabled={u.id === me?.id}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      u.role === 'admin' ? 'border-primary/40 text-primary bg-primary/10 hover:bg-primary/20' : 'border-border text-muted-foreground hover:border-foreground/30'
                    } disabled:cursor-not-allowed disabled:opacity-50`}>
                    {u.role === 'admin' ? 'Admin' : 'Cliente'}
                  </button>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString('es-CL')}</td>
                <td className="px-4 py-3">
                  <button disabled={u.id === me?.id} onClick={() => u.id !== me?.id && setConfirm(u.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors text-xs disabled:opacity-30 disabled:cursor-not-allowed">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No hay usuarios registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {users.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No hay usuarios registrados</p>}
        {users.map(u => (
          <div key={u.id} className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground font-medium text-sm">{u.name}</p>
                    {u.id === me?.id && <span className="text-xs text-primary/60">(tú)</span>}
                  </div>
                  <p className="text-muted-foreground text-xs">{u.email}</p>
                  {u.phone && <p className="text-muted-foreground text-xs">{u.phone}</p>}
                </div>
              </div>
              <button onClick={() => u.id !== me?.id && handleRoleToggle(u)} disabled={u.id === me?.id}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors shrink-0 ml-2 ${
                  u.role === 'admin' ? 'border-primary/40 text-primary bg-primary/10' : 'border-border text-muted-foreground'
                } disabled:cursor-not-allowed disabled:opacity-50`}>
                {u.role === 'admin' ? 'Admin' : 'Cliente'}
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Registro: {new Date(u.created_at).toLocaleDateString('es-CL')}</span>
              <button disabled={u.id === me?.id} onClick={() => u.id !== me?.id && setConfirm(u.id)}
                className="text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <FormModal title="Nuevo usuario" fields={FIELDS} data={form}
          onChange={handleChange} onSubmit={handleSubmit}
          onClose={() => setModal(false)} loading={saving} error={error} />
      )}
      {confirm && (
        <ConfirmModal message="¿Eliminar este usuario? Se eliminarán también sus citas."
          onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
      )}
    </div>
  )
}
