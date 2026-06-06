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
  const [options, setOptions]   = useState(initial.options || [])   // existing (have id)
  const [newOpts, setNewOpts]   = useState([])                      // to be created
  const [deleted, setDeleted]   = useState([])                      // ids to delete
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── options helpers ──────────────────────────────────────────────────────

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

  // ── submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')

    // validate options when has_options
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

      // delete removed options
      await Promise.all(deleted.map(optId => adminDeleteServiceOption(serviceId, optId).catch(() => {})))

      // update existing options
      await Promise.all(
        options.map(o => adminUpdateServiceOption(serviceId, o.id, {
          name: o.name, price: Number(o.price), is_active: o.is_active ?? true, price_from: o.price_from ?? false,
        }).catch(() => {}))
      )

      // create new options
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-dark-card border border-dark-border rounded-sm w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border shrink-0">
          <h2 className="font-light text-lg" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#F2EFE9' }}>{title}</h2>
          <button onClick={onClose} className="text-xl leading-none hover:text-gold transition-colors" style={{ color: '#A09890' }}>&times;</button>
        </div>

        {/* Body — scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Nombre *</label>
            <input required value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full bg-dark border border-dark-border text-white px-3 py-2 text-sm rounded-sm
                         focus:outline-none focus:border-gold transition-colors placeholder:text-gray-600"
              placeholder="Ej: Corte clásico" />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Descripción</label>
            <textarea value={form.description || ''} onChange={e => set('description', e.target.value)}
              rows={2}
              className="w-full bg-dark border border-dark-border text-white px-3 py-2 text-sm rounded-sm
                         focus:outline-none focus:border-gold transition-colors resize-none placeholder:text-gray-600"
              placeholder="Descripción del servicio" />
          </div>

          {/* Duración + Precio base + Abono */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Duración (min) *</label>
              <input required type="number" min={5} max={480} value={form.duration_minutes}
                onChange={e => set('duration_minutes', e.target.value)}
                className="w-full bg-dark border border-dark-border text-white px-3 py-2 text-sm rounded-sm
                           focus:outline-none focus:border-gold transition-colors" />
            </div>
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Precio base ($) *</label>
              <input required type="number" min={0} step={100} value={form.price}
                onChange={e => set('price', e.target.value)}
                className="w-full bg-dark border border-dark-border text-white px-3 py-2 text-sm rounded-sm
                           focus:outline-none focus:border-gold transition-colors" />
            </div>
          </div>

          {/* Monto de abono */}
          <div>
            <label className="block text-gray-400 text-xs uppercase tracking-wider mb-1">
              Monto de abono CLP
              <span className="ml-1 normal-case" style={{ color: '#9A918C' }}>(0 = sin abono)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="text"
                value={fmtClp(form.deposit_amount)}
                onChange={e => set('deposit_amount', parseClp(e.target.value))}
                placeholder="0"
                className="w-full bg-dark border border-dark-border text-white pl-7 pr-3 py-2 text-sm rounded-sm
                           focus:outline-none focus:border-gold transition-colors" />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.is_active}
                onChange={e => set('is_active', e.target.checked)}
                className="accent-gold w-4 h-4" />
              <span className="text-gray-300 text-sm">Servicio activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.price_from}
                onChange={e => set('price_from', e.target.checked)}
                className="accent-gold w-4 h-4" />
              <span className="text-gray-300 text-sm">Mostrar "desde" en el precio del servicio</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.has_options}
                onChange={e => set('has_options', e.target.checked)}
                className="accent-gold w-4 h-4" />
              <span className="text-gray-300 text-sm">Este servicio tiene opciones con precios individuales</span>
            </label>
          </div>

          {/* Options panel */}
          {form.has_options && (
            <div className="border border-dark-border rounded-sm p-4 space-y-3">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Opciones del servicio</p>

              {/* Existing options */}
              {options.map((opt, i) => (
                <div key={opt.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <input value={opt.name} onChange={e => updateExisting(i, 'name', e.target.value)}
                      placeholder="Nombre"
                      className="flex-1 bg-dark border border-dark-border text-white px-3 py-1.5 text-sm rounded-sm
                                 focus:outline-none focus:border-gold transition-colors placeholder:text-gray-600" />
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input type="number" min={0} step={100} value={opt.price}
                        onChange={e => updateExisting(i, 'price', e.target.value)}
                        placeholder="Precio"
                        className="w-28 bg-dark border border-dark-border text-white pl-5 pr-2 py-1.5 text-sm rounded-sm
                                   focus:outline-none focus:border-gold transition-colors" />
                    </div>
                    <button type="button" onClick={() => removeExisting(opt)}
                      className="text-gray-500 hover:text-red-400 transition-colors text-lg leading-none shrink-0"
                      title="Eliminar opción">&times;</button>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none pl-1">
                    <input type="checkbox" checked={opt.price_from ?? false}
                      onChange={e => updateExisting(i, 'price_from', e.target.checked)}
                      className="accent-gold w-3.5 h-3.5" />
                    <span className="text-gray-500 text-xs">Mostrar "desde"</span>
                  </label>
                </div>
              ))}

              {/* New options */}
              {newOpts.map((opt, i) => (
                <div key={`new-${i}`} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <input value={opt.name} onChange={e => updateNew(i, 'name', e.target.value)}
                      placeholder="Nombre"
                      className="flex-1 bg-dark border border-gold/40 text-white px-3 py-1.5 text-sm rounded-sm
                                 focus:outline-none focus:border-gold transition-colors placeholder:text-gray-600" />
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input type="number" min={0} step={100} value={opt.price}
                        onChange={e => updateNew(i, 'price', e.target.value)}
                        placeholder="Precio"
                        className="w-28 bg-dark border border-gold/40 text-white pl-5 pr-2 py-1.5 text-sm rounded-sm
                                   focus:outline-none focus:border-gold transition-colors" />
                    </div>
                    <button type="button" onClick={() => removeNew(i)}
                      className="text-gray-500 hover:text-red-400 transition-colors text-lg leading-none shrink-0"
                      title="Eliminar opción">&times;</button>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none pl-1">
                    <input type="checkbox" checked={opt.price_from ?? false}
                      onChange={e => updateNew(i, 'price_from', e.target.checked)}
                      className="accent-gold w-3.5 h-3.5" />
                    <span className="text-gray-500 text-xs">Mostrar "desde"</span>
                  </label>
                </div>
              ))}

              <button type="button" onClick={addNewOpt}
                className="text-gold text-xs uppercase tracking-wider hover:text-gold-light transition-colors">
                + Agregar opción
              </button>
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-dark-border shrink-0">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm border border-dark-border rounded-sm transition-colors hover:border-gold"
            style={{ color: '#A09890' }}>
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
  const [modal, setModal]       = useState(null)   // null | { mode: 'create'|'edit', data }
  const [confirm, setConfirm]   = useState(null)   // id to delete

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
          <h1 className="text-2xl font-bold text-white">Servicios</h1>
          <p className="text-gray-500 text-sm mt-1">{services.length} servicios registrados</p>
        </div>
        <button onClick={openCreate} className="btn-gold">+ Nuevo servicio</button>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              {['Nombre', 'Duración', 'Precio', 'Opciones', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left text-gray-500 text-xs uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} className="border-b border-dark-border/50 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{s.name}</p>
                  {s.description && <p className="text-gray-500 text-xs mt-0.5 truncate max-w-xs">{s.description}</p>}
                </td>
                <td className="px-4 py-3 text-gray-300">{s.duration_minutes} min</td>
                <td className="px-4 py-3 text-gold font-medium">${s.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {s.has_options ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                      {s.options?.length ?? 0} opciones
                    </span>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleToggle(s)}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                      s.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30'
                    }`}>
                    {s.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-gold transition-colors text-xs">Editar</button>
                    <button onClick={() => setConfirm(s.id)} className="text-gray-400 hover:text-red-400 transition-colors text-xs">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">No hay servicios registrados</td></tr>
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
