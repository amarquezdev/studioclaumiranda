import { useEffect, useState } from 'react'
import {
  adminGetServices, adminCreateService, adminUpdateService, adminDeleteService,
  adminCreateServiceOption, adminUpdateServiceOption, adminDeleteServiceOption,
} from '../../api/client'
import ConfirmModal from '../components/ConfirmModal'

// ── Inline ServiceModal ────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '', description: '', duration_minutes: 30,
  price: 0, is_active: true, has_options: false, price_from: false, deposit_amount: 0,
}

const fmtClp = (n) => (!n || n === 0) ? '' : Math.round(Number(n)).toLocaleString('es-CL')
const parseClp = (str) => {
  const clean = str.replace(/\./g, '').replace(/[^\d]/g, '')
  return clean === '' ? 0 : parseInt(clean, 10)
}
const EMPTY_OPTION = { name: '', price: '' }

function ServiceModal({ title, initial, onClose, onSaved }) {
  const [form, setForm]         = useState(initial)
  const [options, setOptions]   = useState(initial.options || [])
  const [newOpts, setNewOpts]   = useState([])
  const [deleted, setDeleted]   = useState([])
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addNewOpt = () => setNewOpts(o => [...o, { ...EMPTY_OPTION }])

  const updateExisting = (idx, k, v) =>
    setOptions(o => o.map((x, i) => i === idx ? { ...x, [k]: v } : x))

  const removeExisting = (opt) => {
    setOptions(o => o.filter(x => x.id !== opt.id))
    setDeleted(d => [...d, opt.id])
  }

  const updateNew = (idx, k, v) =>
    setNewOpts(o => o.map((x, i) => i === idx ? { ...x, [k]: v } : x))

  const removeNew = (idx) =>
    setNewOpts(o => o.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')

    if (form.has_options) {
      const allOpts = [...options, ...newOpts]
      if (allOpts.length === 0) {
        setError('Agrega al menos una opción o desmarca "tiene opciones".')
        setSaving(false); return
      }
      for (const o of allOpts) {
        if (!o.name.trim()) { setError('Todas las opciones deben tener nombre.'); setSaving(false); return }
        if (o.price === '' || isNaN(Number(o.price)) || Number(o.price) < 0) {
          setError('Todas las opciones deben tener un precio válido.'); setSaving(false); return
        }
      }
    }

    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        duration_minutes: Number(form.duration_minutes),
        price: Number(form.price),
        is_active: form.is_active,
        has_options: form.has_options,
        price_from: form.price_from,
        deposit_amount: Number(form.deposit_amount) || 0,
      }

      let serviceId = form.id
      if (serviceId) {
        await adminUpdateService(serviceId, payload)
      } else {
        const res = await adminCreateService(payload)
        serviceId = res.data.id
      }

      await Promise.all(deleted.map(optId => adminDeleteServiceOption(serviceId, optId).catch(() => {})))
      await Promise.all(
        options.map(o => adminUpdateServiceOption(serviceId, o.id, {
          name: o.name, price: Number(o.price), is_active: o.is_active ?? true, price_from: o.price_from ?? false,
        }).catch(() => {}))
      )
      await Promise.all(
        newOpts.map(o => adminCreateServiceOption(serviceId, {
          name: o.name, price: Number(o.price), price_from: o.price_from ?? false,
        }))
      )

      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const inputBase = "w-full bg-input border border-border text-foreground px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-card border border-border rounded-sm w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-light text-lg text-foreground">{title}</h2>
          <button onClick={onClose} className="text-xl leading-none text-muted-foreground hover:text-primary transition-colors">&times;</button>
        </div>

        {/* Body — scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Nombre *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)}
              className={inputBase}
              placeholder="Ej: Corte clásico" />
          </div>

          <div>
            <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Descripción</label>
            <textarea value={form.description || ''} onChange={e => set('description', e.target.value)}
              rows={2}
              className={`${inputBase} resize-none`}
              placeholder="Descripción del servicio" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Duración (min) *</label>
              <input required type="number" min={5} max={480} value={form.duration_minutes}
                onChange={e => set('duration_minutes', e.target.value)}
                className={inputBase} />
            </div>
            <div>
              <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Precio base ($) *</label>
              <input required type="number" min={0} step={100} value={form.price}
                onChange={e => set('price', e.target.value)}
                className={inputBase} />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">
              Monto de abono CLP
              <span className="ml-1 normal-case text-muted-foreground/70">(0 = sin abono)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <input
                type="text"
                value={fmtClp(form.deposit_amount)}
                onChange={e => set('deposit_amount', parseClp(e.target.value))}
                placeholder="0"
                className={`${inputBase} pl-7`} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.is_active}
                onChange={e => set('is_active', e.target.checked)}
                className="accent-primary w-4 h-4" />
              <span className="text-foreground text-sm">Servicio activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.price_from}
                onChange={e => set('price_from', e.target.checked)}
                className="accent-primary w-4 h-4" />
              <span className="text-foreground text-sm">Mostrar "desde" en el precio del servicio</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.has_options}
                onChange={e => set('has_options', e.target.checked)}
                className="accent-primary w-4 h-4" />
              <span className="text-foreground text-sm">Este servicio tiene opciones con precios individuales</span>
            </label>
          </div>

          {form.has_options && (
            <div className="border border-border rounded-sm p-4 space-y-3">
              <p className="text-muted-foreground text-xs uppercase tracking-wider">Opciones del servicio</p>

              {options.map((opt, i) => (
                <div key={opt.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <input value={opt.name} onChange={e => updateExisting(i, 'name', e.target.value)}
                      placeholder="Nombre"
                      className="flex-1 bg-input border border-border text-foreground px-3 py-1.5 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground" />
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <input type="number" min={0} step={100} value={opt.price}
                        onChange={e => updateExisting(i, 'price', e.target.value)}
                        placeholder="Precio"
                        className="w-28 bg-input border border-border text-foreground pl-5 pr-2 py-1.5 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <button type="button" onClick={() => removeExisting(opt)}
                      className="text-muted-foreground hover:text-red-400 transition-colors text-lg leading-none shrink-0"
                      title="Eliminar opción">&times;</button>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none pl-1">
                    <input type="checkbox" checked={opt.price_from ?? false}
                      onChange={e => updateExisting(i, 'price_from', e.target.checked)}
                      className="accent-primary w-3.5 h-3.5" />
                    <span className="text-muted-foreground text-xs">Mostrar "desde"</span>
                  </label>
                </div>
              ))}

              {newOpts.map((opt, i) => (
                <div key={`new-${i}`} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <input value={opt.name} onChange={e => updateNew(i, 'name', e.target.value)}
                      placeholder="Nombre"
                      className="flex-1 bg-input border border-primary/40 text-foreground px-3 py-1.5 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground" />
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <input type="number" min={0} step={100} value={opt.price}
                        onChange={e => updateNew(i, 'price', e.target.value)}
                        placeholder="Precio"
                        className="w-28 bg-input border border-primary/40 text-foreground pl-5 pr-2 py-1.5 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <button type="button" onClick={() => removeNew(i)}
                      className="text-muted-foreground hover:text-red-400 transition-colors text-lg leading-none shrink-0"
                      title="Eliminar opción">&times;</button>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none pl-1">
                    <input type="checkbox" checked={opt.price_from ?? false}
                      onChange={e => updateNew(i, 'price_from', e.target.checked)}
                      className="accent-primary w-3.5 h-3.5" />
                    <span className="text-muted-foreground text-xs">Mostrar "desde"</span>
                  </label>
                </div>
              ))}

              <button type="button" onClick={addNewOpt}
                className="text-primary text-xs uppercase tracking-wider hover:opacity-80 transition-opacity">
                + Agregar opción
              </button>
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded-sm transition-colors hover:border-primary text-muted-foreground">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="btn-gold disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page component ─────────────────────────────────────────────────────────

export default function Services() {
  const [services, setServices] = useState([])
  const [modal, setModal]       = useState(null)
  const [confirm, setConfirm]   = useState(null)

  const load = () => adminGetServices().then(r => setServices(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const openCreate = () => setModal({ mode: 'create', data: { ...EMPTY_FORM } })
  const openEdit   = (s)  => setModal({ mode: 'edit',   data: { ...s } })

  const handleToggle = async (s) => {
    await adminUpdateService(s.id, { is_active: !s.is_active }).catch(() => {})
    load()
  }

  const handleDelete = async () => {
    await adminDeleteService(confirm).catch(() => {})
    setConfirm(null); load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light tracking-wide text-foreground">Servicios</h1>
          <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mt-1">{services.length} servicios registrados</p>
        </div>
        <button onClick={openCreate} className="btn-gold">+ Nuevo servicio</button>
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Nombre', 'Duración', 'Precio', 'Opciones', 'Estado', 'Acciones'].map(h => (
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
                <td className="px-4 py-3 text-muted-foreground">{s.duration_minutes} min</td>
                <td className="px-4 py-3 text-primary font-medium">${s.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {s.has_options ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                      {s.options?.length ?? 0} opciones
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
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
            {services.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">No hay servicios registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <ServiceModal
          title={modal.mode === 'create' ? 'Nuevo servicio' : 'Editar servicio'}
          initial={modal.data}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}

      {confirm && (
        <ConfirmModal
          message="¿Eliminar este servicio? Las citas existentes no se verán afectadas."
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
