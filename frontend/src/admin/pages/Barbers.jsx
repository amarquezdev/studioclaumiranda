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
  const openEdit   = (b) => { setForm({ ...b }); setEditing(b.id); setError(''); setModal('form') }
  const handleChange = (name, value) => setForm(f => ({ ...f, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      editing ? await adminUpdateBarber(editing, form) : await adminCreateBarber(form)
      setModal(null); load()
    } catch (err) { setError(err.response?.data?.detail || 'Error al guardar') }
    finally { setSaving(false) }
  }

  const handleToggle = async (b) => { await adminUpdateBarber(b.id, { is_active: !b.is_active }).catch(() => {}); load() }
  const handleDelete = async () => { await adminDeleteBarber(confirm).catch(() => {}); setConfirm(null); load() }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-foreground">Estilistas</h1>
          <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mt-1">{barbers.length} estilistas registrados</p>
        </div>
        <button onClick={openCreate} className="btn-gold self-start sm:self-auto">+ Nuevo estilista</button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Estilista', 'Contacto', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left text-muted-foreground text-xs uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {barbers.map(b => (
              <tr key={b.id} className="border-b border-border/50 hover:bg-foreground/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold">
                      {b.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-foreground font-medium">{b.name}</p>
                      {b.bio && <p className="text-muted-foreground text-xs mt-0.5 truncate max-w-xs">{b.bio}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-muted-foreground text-xs">{b.email}</p>
                  {b.phone && <p className="text-muted-foreground text-xs">{b.phone}</p>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(b)}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                      b.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-foreground/10 text-muted-foreground hover:bg-foreground/20'
                    }`}>
                    {b.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(b)} className="text-muted-foreground hover:text-primary transition-colors text-xs">Editar</button>
                    <button onClick={() => setConfirm(b.id)} className="text-muted-foreground hover:text-red-400 transition-colors text-xs">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {barbers.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">No hay estilistas registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {barbers.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No hay estilistas registrados</p>}
        {barbers.map(b => (
          <div key={b.id} className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                  {b.name.charAt(0)}
                </div>
                <div>
                  <p className="text-foreground font-medium text-sm">{b.name}</p>
                  <p className="text-muted-foreground text-xs">{b.email}</p>
                  {b.phone && <p className="text-muted-foreground text-xs">{b.phone}</p>}
                  {b.bio && <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{b.bio}</p>}
                </div>
              </div>
              <button onClick={() => handleToggle(b)}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors shrink-0 ml-2 ${
                  b.is_active ? 'bg-green-500/20 text-green-400' : 'bg-foreground/10 text-muted-foreground'
                }`}>
                {b.is_active ? 'Activo' : 'Inactivo'}
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 flex gap-4">
              <button onClick={() => openEdit(b)} className="text-muted-foreground hover:text-primary transition-colors text-xs">Editar</button>
              <button onClick={() => setConfirm(b.id)} className="text-muted-foreground hover:text-red-400 transition-colors text-xs">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {modal === 'form' && (
        <FormModal title={editing ? 'Editar estilista' : 'Nuevo estilista'}
          fields={FIELDS} data={form} onChange={handleChange} onSubmit={handleSubmit}
          onClose={() => setModal(null)} loading={saving} error={error} />
      )}
      {confirm && (
        <ConfirmModal message="¿Eliminar este estilista? Se eliminarán también sus citas asociadas."
          onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
      )}
    </div>
  )
}
