import { useEffect, useRef, useState } from 'react'
import {
  adminGetServices, adminCreateService, adminUpdateService, adminDeleteService,
  adminCreateServiceOption, adminUpdateServiceOption, adminDeleteServiceOption,
  getServiceTypes, adminCreateServiceType, adminDeleteServiceType,
} from '../../api/client'
import ConfirmModal from '../components/ConfirmModal'

// ── Inline ServiceModal ────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '', description: '', duration_minutes: 30,
  price: 0, is_active: true, has_options: false, price_from: false, deposit_amount: 0,
  service_type_id: null,
}

const fmtClp = (n) => (!n || n === 0) ? '' : Math.round(Number(n)).toLocaleString('es-CL')
const parseClp = (str) => {
  const clean = str.replace(/\./g, '').replace(/[^\d]/g, '')
  return clean === '' ? 0 : parseInt(clean, 10)
}
const EMPTY_OPTION = { name: '', price: '' }

function ServiceModal({ title, initial, serviceTypes, onClose, onSaved }) {
  const [form, setForm]       = useState(initial)
  const [options, setOptions] = useState(initial.options || [])
  const [newOpts, setNewOpts] = useState([])
  const [deleted, setDeleted] = useState([])
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const dragIdx = useRef(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const addNewOpt = () => setNewOpts(o => [...o, { ...EMPTY_OPTION }])
  const updateExisting = (idx, k, v) => setOptions(o => o.map((x, i) => i === idx ? { ...x, [k]: v } : x))
  const removeExisting = (opt) => { setOptions(o => o.filter(x => x.id !== opt.id)); setDeleted(d => [...d, opt.id]) }
  const updateNew = (idx, k, v) => setNewOpts(o => o.map((x, i) => i === idx ? { ...x, [k]: v } : x))
  const removeNew = (idx) => setNewOpts(o => o.filter((_, i) => i !== idx))

  const handleDragStart = (i) => { dragIdx.current = i }
  const handleDragOver  = (e, i) => {
    e.preventDefault()
    if (dragIdx.current === null || dragIdx.current === i) return
    setOptions(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx.current, 1)
      next.splice(i, 0, moved)
      dragIdx.current = i
      return next
    })
  }
  const handleDragEnd = () => { dragIdx.current = null }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    if (form.has_options) {
      const allOpts = [...options, ...newOpts]
      if (allOpts.length === 0) { setError('Agrega al menos una opción o desmarca "tiene opciones".'); setSaving(false); return }
      for (const o of allOpts) {
        if (!o.name.trim()) { setError('Todas las opciones deben tener nombre.'); setSaving(false); return }
        if (o.price === '' || isNaN(Number(o.price)) || Number(o.price) < 0) { setError('Todas las opciones deben tener un precio válido.'); setSaving(false); return }
      }
    }
    try {
      const payload = {
        name: form.name, description: form.description || null,
        duration_minutes: Number(form.duration_minutes), price: Number(form.price),
        is_active: form.is_active, has_options: form.has_options, price_from: form.price_from,
        deposit_amount: Number(form.deposit_amount) || 0,
        service_type_id: form.service_type_id ? Number(form.service_type_id) : null,
      }
      let serviceId = form.id
      if (serviceId) { await adminUpdateService(serviceId, payload) }
      else { const res = await adminCreateService(payload); serviceId = res.data.id }
      await Promise.all(deleted.map(optId => adminDeleteServiceOption(serviceId, optId).catch(() => {})))
      await Promise.all(options.map((o, i) => adminUpdateServiceOption(serviceId, o.id, { name: o.name, price: Number(o.price), is_active: o.is_active ?? true, price_from: o.price_from ?? false, sort_order: i }).catch(() => {})))
      await Promise.all(newOpts.map((o, i) => adminCreateServiceOption(serviceId, { name: o.name, price: Number(o.price), price_from: o.price_from ?? false, sort_order: options.length + i })))
      onSaved()
    } catch (err) { setError(err.response?.data?.detail || 'Error al guardar') }
    finally { setSaving(false) }
  }

  const inputBase = "w-full bg-input border border-border text-foreground px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-card border border-border rounded-sm w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-light text-lg text-foreground">{title}</h2>
          <button onClick={onClose} className="text-xl leading-none text-muted-foreground hover:text-primary transition-colors">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          <div>
            <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Nombre *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)} className={inputBase} placeholder="Ej: Corte clásico" />
          </div>
          <div>
            <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Tipo de servicio</label>
            <select value={form.service_type_id ?? ''} onChange={e => set('service_type_id', e.target.value === '' ? null : Number(e.target.value))} className={inputBase}>
              <option value="">Sin categoría</option>
              {serviceTypes.filter(t => t.is_active).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Descripción</label>
            <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={2} className={`${inputBase} resize-none`} placeholder="Descripción del servicio" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Duración (min) *</label>
              <input required type="number" min={5} max={480} value={form.duration_minutes} onChange={e => set('duration_minutes', e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Precio base ($) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  value={fmtClp(form.price)}
                  onChange={e => set('price', parseClp(e.target.value))}
                  placeholder="0"
                  className={`${inputBase} pl-7`}
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">
              Monto de abono CLP <span className="ml-1 normal-case text-muted-foreground/70">(0 = sin abono)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <input type="text" value={fmtClp(form.deposit_amount)} onChange={e => set('deposit_amount', parseClp(e.target.value))} placeholder="0" className={`${inputBase} pl-7`} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="accent-primary w-4 h-4" />
              <span className="text-foreground text-sm">Servicio activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.price_from} onChange={e => set('price_from', e.target.checked)} className="accent-primary w-4 h-4" />
              <span className="text-foreground text-sm">Mostrar "desde" en el precio del servicio</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.has_options} onChange={e => set('has_options', e.target.checked)} className="accent-primary w-4 h-4" />
              <span className="text-foreground text-sm">Este servicio tiene opciones con precios individuales</span>
            </label>
          </div>
          {form.has_options && (
            <div className="border border-border rounded-sm p-4 space-y-3">
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Opciones del servicio</p>
              {options.map((opt, i) => (
                <div key={opt.id} className="flex flex-col gap-1.5"
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={e => handleDragOver(e, i)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center gap-2">
                    <span className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0 select-none" title="Arrastrar para reordenar">⠿</span>
                    <input value={opt.name} onChange={e => updateExisting(i, 'name', e.target.value)} placeholder="Nombre"
                      className="flex-1 bg-input border border-border text-foreground px-3 py-1.5 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground" />
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <input type="text" inputMode="numeric" value={fmtClp(opt.price)} onChange={e => updateExisting(i, 'price', parseClp(e.target.value))} placeholder="0"
                        className="w-28 bg-input border border-border text-foreground pl-5 pr-2 py-1.5 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <button type="button" onClick={() => removeExisting(opt)} className="text-muted-foreground hover:text-red-400 transition-colors text-lg leading-none shrink-0">&times;</button>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none pl-5">
                    <input type="checkbox" checked={opt.price_from ?? false} onChange={e => updateExisting(i, 'price_from', e.target.checked)} className="accent-primary w-3.5 h-3.5" />
                    <span className="text-muted-foreground text-xs">Mostrar "desde"</span>
                  </label>
                </div>
              ))}
              {newOpts.map((opt, i) => (
                <div key={`new-${i}`} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <input value={opt.name} onChange={e => updateNew(i, 'name', e.target.value)} placeholder="Nombre"
                      className="flex-1 bg-input border border-primary/40 text-foreground px-3 py-1.5 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground" />
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <input type="text" inputMode="numeric" value={fmtClp(opt.price)} onChange={e => updateNew(i, 'price', parseClp(e.target.value))} placeholder="0"
                        className="w-28 bg-input border border-primary/40 text-foreground pl-5 pr-2 py-1.5 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <button type="button" onClick={() => removeNew(i)} className="text-muted-foreground hover:text-red-400 transition-colors text-lg leading-none shrink-0">&times;</button>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none pl-1">
                    <input type="checkbox" checked={opt.price_from ?? false} onChange={e => updateNew(i, 'price_from', e.target.checked)} className="accent-primary w-3.5 h-3.5" />
                    <span className="text-muted-foreground text-xs">Mostrar "desde"</span>
                  </label>
                </div>
              ))}
              <button type="button" onClick={addNewOpt} className="text-primary text-xs uppercase tracking-wider hover:opacity-80 transition-opacity">+ Agregar opción</button>
            </div>
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </form>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-sm transition-colors hover:border-primary text-muted-foreground">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="btn-gold disabled:opacity-50 disabled:cursor-not-allowed">{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  )
}

// ── Page component ─────────────────────────────────────────────────────────

export default function Services() {
  const [services, setServices]         = useState([])
  const [serviceTypes, setServiceTypes] = useState([])
  const [modal, setModal]               = useState(null)
  const [confirm, setConfirm]           = useState(null)
  const [newTypeName, setNewTypeName]   = useState('')
  const [showTypePanel, setShowTypePanel] = useState(false)
  const [loading, setLoading]           = useState(true)

  const load = () => { setLoading(true); adminGetServices().then(r => setServices(r.data)).catch(() => {}).finally(() => setLoading(false)) }
  const loadTypes = () => getServiceTypes().then(r => setServiceTypes(r.data)).catch(() => {})
  useEffect(() => { load(); loadTypes() }, [])

  const handleCreateType = async () => {
    if (!newTypeName.trim()) return
    await adminCreateServiceType({ name: newTypeName.trim() }).catch(() => {})
    setNewTypeName(''); loadTypes()
  }
  const handleDeleteType = async (id) => { await adminDeleteServiceType(id).catch(() => {}); loadTypes() }
  const openCreate = () => setModal({ mode: 'create', data: { ...EMPTY_FORM } })
  const openEdit   = (s)  => setModal({ mode: 'edit',   data: { ...s } })
  const handleToggle = async (s) => { await adminUpdateService(s.id, { is_active: !s.is_active }).catch(() => {}); load() }
  const handleDelete = async () => { await adminDeleteService(confirm).catch(() => {}); setConfirm(null); load() }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-foreground">Servicios</h1>
          <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mt-1">{services.length} servicios registrados</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setShowTypePanel(p => !p)}
            className="px-4 py-2 text-sm border border-border rounded-sm transition-colors hover:border-primary text-muted-foreground">
            Tipos de servicio
          </button>
          <button onClick={openCreate} className="btn-gold">+ Nuevo servicio</button>
        </div>
      </div>

      {showTypePanel && (
        <div className="bg-card border border-border rounded-sm p-5 mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Gestionar tipos de servicio</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {serviceTypes.map(t => (
              <span key={t.id} className="flex items-center gap-1.5 text-sm bg-foreground/5 border border-border rounded-sm px-3 py-1">
                {t.name}
                <button onClick={() => handleDeleteType(t.id)} className="text-muted-foreground hover:text-red-400 transition-colors leading-none">&times;</button>
              </span>
            ))}
            {serviceTypes.length === 0 && <span className="text-muted-foreground text-xs">Sin tipos creados</span>}
          </div>
          <div className="flex gap-2">
            <input value={newTypeName} onChange={e => setNewTypeName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreateType()}
              placeholder="Nuevo tipo..." className="bg-input border border-border text-foreground px-3 py-1.5 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground" />
            <button onClick={handleCreateType} className="px-4 py-1.5 text-sm border border-primary text-primary rounded-sm hover:bg-primary/10 transition-colors">Agregar</button>
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block bg-card border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Nombre', 'Tipo', 'Duración', 'Precio', 'Opciones', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left text-muted-foreground text-xs uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-foreground/5 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-foreground font-medium">{s.name}</p>
                  {s.description && <p className="text-muted-foreground text-xs mt-0.5 truncate max-w-xs">{s.description}</p>}
                </td>
                <td className="px-4 py-3">
                  {s.service_type ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s.service_type.name}</span>
                  ) : <span className="text-muted-foreground text-xs">—</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.duration_minutes} min</td>
                <td className="px-4 py-3 text-primary font-medium">${s.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {s.has_options
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">{s.options?.length ?? 0} opciones</span>
                    : <span className="text-muted-foreground text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(s)}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                      s.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-foreground/10 text-muted-foreground hover:bg-foreground/20'
                    }`}>
                    {s.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(s)} className="text-muted-foreground hover:text-primary transition-colors text-xs">Editar</button>
                    <button onClick={() => setConfirm(s.id)} className="text-muted-foreground hover:text-red-400 transition-colors text-xs">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {loading && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">Cargando servicios...</td></tr>
            )}
            {!loading && services.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No hay servicios registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading && <p className="text-muted-foreground text-sm text-center py-8">Cargando servicios...</p>}
        {!loading && services.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No hay servicios registrados</p>}
        {services.map(s => (
          <div key={s.id} className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-foreground font-medium text-sm">{s.name}</p>
                {s.description && <p className="text-muted-foreground text-xs mt-0.5">{s.description}</p>}
              </div>
              <button onClick={() => handleToggle(s)}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors shrink-0 ml-2 ${
                  s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-foreground/10 text-muted-foreground'
                }`}>
                {s.is_active ? 'Activo' : 'Inactivo'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/50 text-xs">
              <div>
                <p className="text-muted-foreground uppercase tracking-wider" style={{fontSize:'9px'}}>Tipo</p>
                <p className="text-foreground mt-0.5">{s.service_type?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase tracking-wider" style={{fontSize:'9px'}}>Duración</p>
                <p className="text-foreground mt-0.5">{s.duration_minutes} min</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase tracking-wider" style={{fontSize:'9px'}}>Precio</p>
                <p className="text-primary font-medium mt-0.5">${s.price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase tracking-wider" style={{fontSize:'9px'}}>Opciones</p>
                <p className="text-foreground mt-0.5">{s.has_options ? `${s.options?.length ?? 0} opciones` : '—'}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 flex gap-4">
              <button onClick={() => openEdit(s)} className="text-muted-foreground hover:text-primary transition-colors text-xs">Editar</button>
              <button onClick={() => setConfirm(s.id)} className="text-muted-foreground hover:text-red-400 transition-colors text-xs">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <ServiceModal
          title={modal.mode === 'create' ? 'Nuevo servicio' : 'Editar servicio'}
          initial={modal.data} serviceTypes={serviceTypes}
          onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }}
        />
      )}
      {confirm && (
        <ConfirmModal message="¿Eliminar este servicio? Las citas existentes no se verán afectadas."
          onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
      )}
    </div>
  )
}
