import { useEffect, useState } from 'react'
import { adminGetBarbers, adminCreateBarber, adminUpdateBarber, adminDeleteBarber } from '../../api/client'
import FormModal from '../components/FormModal'
import ConfirmModal from '../components/ConfirmModal'

const FIELDS = [
  { name: 'name',      label: 'Nombre',    required: true, placeholder: 'Ej: Carlos Rodríguez' },
  { name: 'email',     label: 'Email',     type: 'email', required: true, placeholder: 'carlos@barbershop.cl' },
  { name: 'phone',     label: 'Teléfono',  placeholder: '+56 9 1234 5678' },
  { name: 'bio',       label: 'Biografía', type: 'textarea', placeholder: 'Especialidad y experiencia...' },
  { name: 'is_active', label: 'Estado',    type: 'checkbox', checkLabel: 'Estilista activo' },
]

const EMPTY = { name: '', email: '', phone: '', bio: '', is_active: true }

export default function Barbers() {
  const [barbers, setBarbers] = useState([])
  const [modal, setModal]     = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const load = () => adminGetBarbers().then(r => setBarbers(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setEditing(null); setError(''); setModal('form') }
  const openEdit   = (b)  => { setForm({ ...b }); setEditing(b.id); setError(''); setModal('form') }
  const handleChange = (name, value) => setForm(f => ({ ...f, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      editing ? await adminUpdateBarber(editing, form) : await adminCreateBarber(form)
      setModal(null); load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleToggle = async (b) => {
    await adminUpdateBarber(b.id, { is_active: !b.is_active }).catch(() => {})
    load()
  }

  const handleDelete = async () => {
    await adminDeleteBarber(confirm).catch(() => {})
    setConfirm(null); load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Estilistas</h1>
          <p className="text-gray-500 text-sm mt-1">{barbers.length} Estilistas registrados</p>
        </div>
        <button onClick={openCreate} className="btn-gold">+ Nuevo estilista</button>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              {['Estilista', 'Contacto', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {barbers.map(b => (
              <tr key={b.id} className="border-b border-dark-border/50 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold">
                      {b.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{b.name}</p>
                      {b.bio && <p className="text-gray-500 text-xs mt-0.5 truncate max-w-xs">{b.bio}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-300 text-xs">{b.email}</p>
                  {b.phone && <p className="text-gray-500 text-xs">{b.phone}</p>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(b)}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                      b.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30'
                    }`}>
                    {b.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(b)} className="text-gray-400 hover:text-gold transition-colors text-xs">Editar</button>
                    <button onClick={() => setConfirm(b.id)} className="text-gray-400 hover:text-red-400 transition-colors text-xs">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {barbers.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">No hay estilistas registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal === 'form' && (
        <FormModal
          title={editing ? 'Editar estilista' : 'Nuevo estilista'}
          fields={FIELDS}
          data={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => setModal(null)}
          loading={saving}
          error={error}
        />
      )}
      {confirm && (
        <ConfirmModal
          message="¿Eliminar este estilista? Se eliminarán también sus citas asociadas."
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
