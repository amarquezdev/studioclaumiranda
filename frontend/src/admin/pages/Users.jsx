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
  const { user: me }            = useAuth()
  const [users, setUsers]       = useState([])
  const [confirm, setConfirm]   = useState(null)
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const load = () => adminGetUsers().then(r => setUsers(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setError(''); setModal(true) }
  const handleChange = (name, value) => setForm(f => ({ ...f, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      // Register user
      const res = await adminRegisterUser({
        name: form.name, email: form.email,
        phone: form.phone || null, password: form.password,
      })
      // If role is admin, patch it
      if (form.role === 'admin') {
        await adminUpdateUser(res.data.id, { role: 'admin' })
      }
      setModal(false); load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear usuario')
    } finally { setSaving(false) }
  }

  const handleRoleToggle = async (u) => {
    const newRole = u.role === 'admin' ? 'client' : 'admin'
    await adminUpdateUser(u.id, { role: newRole }).catch(() => {})
    load()
  }

  const handleDelete = async () => {
    await adminDeleteUser(confirm).catch(() => {})
    setConfirm(null); load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} usuarios registrados</p>
        </div>
        <button onClick={openCreate} className="btn-gold">+ Nuevo usuario</button>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              {['Usuario', 'Email', 'Teléfono', 'Rol', 'Registro', 'Acciones'].map(h => (
                <th key={h} className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-dark-border/50 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <span className="text-white">{u.name}</span>
                    {u.id === me?.id && <span className="text-xs text-gold/60">(tú)</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{u.email}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => u.id !== me?.id && handleRoleToggle(u)} disabled={u.id === me?.id}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      u.role === 'admin'
                        ? 'border-gold/40 text-gold bg-gold/10 hover:bg-gold/20'
                        : 'border-dark-border text-gray-400 hover:border-gray-500'
                    } disabled:cursor-not-allowed disabled:opacity-50`}>
                    {u.role === 'admin' ? 'Admin' : 'Cliente'}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(u.created_at).toLocaleDateString('es-CL')}
                </td>
                <td className="px-4 py-3">
                  <button disabled={u.id === me?.id} onClick={() => u.id !== me?.id && setConfirm(u.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors text-xs disabled:opacity-30 disabled:cursor-not-allowed">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">No hay usuarios registrados</td></tr>
            )}
          </tbody>
        </table>
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
