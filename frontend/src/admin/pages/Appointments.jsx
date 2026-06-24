import { useEffect, useRef, useState } from 'react'
import {
  adminGetAppointments, adminUpdateApptStatus, adminDeleteAppointment,
  adminCreateAppointment, adminUpdateAppointment, adminGetBarbers, adminGetServices, getAvailability,
} from '../../api/client'
import ConfirmModal from '../components/ConfirmModal'

const STATUS_OPTIONS = ['pending','confirmed','cancelled','completed']
const STATUS_LABELS  = { pending:'Pendiente', confirmed:'Confirmada', cancelled:'Cancelada', completed:'Completada' }
const STATUS_COLORS  = {
  pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-700/40',
  confirmed: 'bg-green-500/20  text-green-400  border-green-700/40',
  cancelled: 'bg-red-500/20    text-red-400    border-red-700/40',
  completed: 'bg-blue-500/20   text-blue-400   border-blue-700/40',
}

function toISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('es-CL', { hour:'2-digit', minute:'2-digit', hour12:false })
}
function fmtDt(iso, opts) {
  if (!iso) return '—'
  const local = iso.replace(/([+-]\d{2}:\d{2}|Z)$/, '')
  return new Date(local).toLocaleString('es-CL', opts)
}
const fmtClp  = v => { const n = parseInt(String(v).replace(/\D/g,''),10); return isNaN(n)||n===0 ? '' : `$${n.toLocaleString('es-CL')}` }
const parseClp = s => { const n = parseInt(String(s).replace(/\D/g,''),10); return isNaN(n) ? 0 : n }

// ── New appointment modal ────────────────────────────────────────────────────

function NewAppointmentModal({ onClose, onCreated }) {
  const [barbers, setBarbers]   = useState([])
  const [services, setServices] = useState([])
  const [slots, setSlots]       = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    barber_id: '', service_ids: [], date: '', slot: null, notes: '', customPrice: '',
  })
  const [selectedOptions, setSelectedOptions] = useState([])
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [loadError, setLoadError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    name: '', email: '', service_ids: '', date: '', slot: '',
  })

  const selectedServices    = services.filter(s => form.service_ids.includes(String(s.id)))
  const totalDuration       = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0)
  const servicesWithOptions = selectedServices.filter(s => s.has_options && s.options?.some(o => o.is_active))

  const toggleService = (id) => {
    const sid = String(id)
    setForm(f => ({
      ...f,
      service_ids: f.service_ids.includes(sid)
        ? f.service_ids.filter(x => x !== sid)
        : [...f.service_ids, sid],
      slot: null,
    }))
    setSelectedOptions([])
    setFieldErrors(f => ({ ...f, service_ids: '' }))
  }

  const toggleOption = (opt) => {
    setSelectedOptions(prev =>
      prev.find(o => o.id === opt.id) ? prev.filter(o => o.id !== opt.id) : [...prev, opt]
    )
  }

  const validate = () => {
    const errors = { name: '', email: '', service_ids: '', date: '', slot: '' }
    const labels = []
    if (!form.name.trim())           { errors.name = 'El nombre del cliente es obligatorio'; labels.push('Nombre') }
    if (!form.email.trim())          { errors.email = 'El email es obligatorio'; labels.push('Email') }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'El email no tiene un formato válido'; labels.push('Email') }
    if (form.service_ids.length === 0) { errors.service_ids = 'Debes seleccionar al menos un servicio'; labels.push('Servicio') }
    if (!form.date)                  { errors.date = 'Debes elegir una fecha'; labels.push('Fecha') }
    if (!form.slot)                  { errors.slot = 'Debes seleccionar una hora disponible'; labels.push('Hora') }
    return { errors, hasErrors: labels.length > 0, message: labels.length ? `Corrige los siguientes campos: ${labels.join(', ')}` : '' }
  }

  useEffect(() => {
    Promise.all([adminGetBarbers(), adminGetServices()])
      .then(([b, s]) => {
        setBarbers(b.data)
        setServices(s.data)
        if (b.data.length > 0) setForm(f => ({ ...f, barber_id: String(b.data[0].id) }))
      })
      .catch(() => setLoadError('No se pudieron cargar estilistas y servicios. Recarga la página.'))
  }, [])

  useEffect(() => {
    if (!form.date || !form.barber_id || form.service_ids.length === 0) return
    setLoadingSlots(true); setSlots([]); setForm(f => ({ ...f, slot: null }))
    getAvailability(form.date, form.barber_id, form.service_ids, { showAll: true })
      .then(r => setSlots(r.data.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [form.date, form.barber_id, form.service_ids])

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setFieldErrors(f => ({ ...f, [k]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { errors, hasErrors, message } = validate()
    if (hasErrors) { setFieldErrors(errors); setError(message); return }
    setSaving(true); setError('')
    try {
      const rawPrice = parseClp(form.customPrice)
      const parts = []
      if (rawPrice > 0) parts.push(`Precio: ${rawPrice}`)
      if (selectedOptions.length > 0) parts.push(`Opciones: ${selectedOptions.map(o => o.name).join(', ')}`)
      if (form.notes) parts.push(form.notes)
      const notes = parts.length > 0 ? parts.join('\n') : null
      await adminCreateAppointment({
        name: form.name, email: form.email, phone: form.phone || null,
        barber_id: Number(form.barber_id), service_ids: form.service_ids.map(Number),
        start_datetime: form.slot.start, notes,
      })
      onCreated()
    } catch (err) {
      const detail = err.response?.data?.detail || 'Error al crear la cita'
      const lower  = detail.toLowerCase()
      if (lower.includes('email'))                                             { setFieldErrors(f => ({ ...f, email: detail })); setError(`Error en el campo Email: ${detail}`) }
      else if (lower.includes('ocup') || lower.includes('conflict') || lower.includes('hora')) { setFieldErrors(f => ({ ...f, slot: detail })); setError(`Conflicto de horario: ${detail}`) }
      else setError(detail)
    } finally { setSaving(false) }
  }

  const inputCls = (field) =>
    'w-full bg-input border px-3 py-2 text-sm rounded-sm focus:outline-none transition-colors text-foreground ' +
    (fieldErrors[field] ? 'border-red-500 focus:border-red-400' : 'border-border focus:border-primary')
  const labelCls = "block text-muted-foreground text-xs uppercase tracking-wider mb-1.5"
  const today = toISO(new Date())

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-light text-lg text-foreground">Nueva cita manual</h3>
          <button onClick={onClose} className="text-xl leading-none text-muted-foreground hover:text-primary transition-colors">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-4">
          {loadError && <div className="border border-red-400/40 text-red-500 text-xs px-3 py-2 rounded-sm bg-red-50">{loadError}</div>}
          {error && <div className="bg-red-900/30 border border-red-800 text-red-400 text-xs px-3 py-2 rounded-sm">{error}</div>}

          <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Datos del cliente</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nombre <span className="text-primary">*</span></label>
              <input className={inputCls('name')} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Juan Pérez" />
              {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <input className={inputCls('phone')} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+56 9..." />
            </div>
          </div>
          <div>
            <label className={labelCls}>Email <span className="text-primary">*</span></label>
            <input type="email" className={inputCls('email')} value={form.email} onChange={e => set('email', e.target.value)} placeholder="juan@email.com" />
            {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          <p className="text-muted-foreground text-xs uppercase tracking-wider font-medium pt-2">Cita</p>
          <div>
            <label className={labelCls}>
              Servicios <span className="text-primary">*</span>
              {selectedServices.length > 0 && (
                <span className="ml-2 normal-case tracking-normal font-normal text-muted-foreground">
                  {selectedServices.length} seleccionado{selectedServices.length > 1 ? 's' : ''} · {totalDuration} min
                </span>
              )}
            </label>
            <div className={`flex flex-wrap gap-2 mt-1 ${fieldErrors.service_ids ? 'p-2 border border-red-500 rounded-sm' : ''}`}>
              {services.map(s => {
                const checked = form.service_ids.includes(String(s.id))
                return (
                  <button type="button" key={s.id} onClick={() => toggleService(s.id)}
                    className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
                      checked
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-foreground/30'
                    }`}>
                    {s.name} · {s.duration_minutes}min
                  </button>
                )
              })}
            </div>
            {fieldErrors.service_ids && <p className="text-red-400 text-xs mt-1">{fieldErrors.service_ids}</p>}
          </div>

          {servicesWithOptions.map(svc => {
            const opts = svc.options.filter(o => o.is_active)
            return (
              <div key={svc.id}>
                <label className={labelCls}>Opciones — {svc.name}</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {opts.map(opt => {
                    const checked = !!selectedOptions.find(o => o.id === opt.id)
                    return (
                      <button type="button" key={opt.id} onClick={() => toggleOption(opt)}
                        className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
                          checked ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground/30'
                        }`}>
                        {opt.name} — ${opt.price.toLocaleString()}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div>
            <label className={labelCls}>Fecha <span className="text-primary">*</span></label>
            <input type="date" className={inputCls('date')} value={form.date} min={today}
              onChange={e => set('date', e.target.value)} />
            {fieldErrors.date && <p className="text-red-400 text-xs mt-1">{fieldErrors.date}</p>}
          </div>

          {form.date && form.barber_id && form.service_ids.length > 0 && (
            <div>
              <label className={labelCls}>Hora disponible <span className="text-primary">*</span></label>
              {loadingSlots && <p className="text-muted-foreground text-xs">Cargando horarios...</p>}
              {!loadingSlots && slots.length === 0 && <p className="text-muted-foreground text-xs">No hay horas disponibles para esta fecha.</p>}
              {!loadingSlots && slots.length > 0 && (
                <div className={`grid grid-cols-4 sm:grid-cols-6 gap-1.5 mt-1 rounded-sm transition-colors ${fieldErrors.slot ? 'border border-red-500 p-2' : ''}`}>
                  {slots.map((slot, i) => {
                    const isSelected = form.slot === slot
                    return (
                      <button type="button" key={i}
                        disabled={!slot.available}
                        onClick={() => { if (slot.available) { set('slot', slot); setFieldErrors(f => ({ ...f, slot: '' })) } }}
                        className={`py-1.5 text-xs border rounded-sm transition-all ${
                          !slot.available
                            ? 'border-border/30 text-muted-foreground/30 line-through cursor-not-allowed'
                            : isSelected
                              ? 'bg-primary text-primary-foreground border-primary font-bold'
                              : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                        }`}>
                        {formatTime(slot.start)}
                      </button>
                    )
                  })}
                </div>
              )}
              {fieldErrors.slot && <p className="text-red-400 text-xs mt-1">{fieldErrors.slot}</p>}
            </div>
          )}

          <div>
            <label className={labelCls}>Precio personalizado <span className="text-muted-foreground normal-case tracking-normal font-normal">(opcional — solo si difiere del precio estándar)</span></label>
            <input
              type="text" inputMode="numeric"
              className={inputCls('customPrice')}
              value={form.customPrice}
              onChange={e => set('customPrice', e.target.value)}
              onBlur={e => { const n = parseClp(e.target.value); set('customPrice', n > 0 ? fmtClp(n) : '') }}
              placeholder="Ej: $45.000"
            />
          </div>

          <div>
            <label className={labelCls}>Notas</label>
            <textarea className={`${inputCls('notes')} resize-none`} rows={2} value={form.notes}
              onChange={e => set('notes', e.target.value)} placeholder="Indicaciones adicionales..." />
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-sm transition-colors hover:border-primary text-muted-foreground">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-gold disabled:opacity-50">
              {saving ? 'Guardando...' : 'Crear cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Edit appointment modal ───────────────────────────────────────────────────

function EditAppointmentModal({ appt, onClose, onSaved }) {
  const [barbers, setBarbers]   = useState([])
  const [services, setServices] = useState([])
  const [slots, setSlots]       = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const initDate      = appt.start_datetime ? appt.start_datetime.replace(/([+-]\d{2}:\d{2}|Z)$/, '').slice(0, 10) : ''
  const initServiceId = appt.appointment_services?.length ? String(appt.appointment_services[0]?.service_id ?? '') : String(appt.service_id ?? '')
  const initSlot      = {
    start: appt.start_datetime?.replace(/([+-]\d{2}:\d{2}|Z)$/, '') ?? '',
    end:   appt.end_datetime?.replace(/([+-]\d{2}:\d{2}|Z)$/, '') ?? '',
  }
  const initCustomPriceRaw = appt.notes ? (appt.notes.match(/(?:^|\n)Precio:\s*(\d+)/)?.[1] ?? '') : ''
  const initCustomPrice    = initCustomPriceRaw ? fmtClp(initCustomPriceRaw) : ''
  const initOptNames  = appt.notes ? (appt.notes.replace(/^Precio:[^\n]*\n?/m,'').match(/^Opciones:\s*(.+?)(\n|$)/) ?? [])[1]?.split(',').map(s => s.trim()).filter(Boolean) ?? [] : []
  const initExtra     = appt.notes ? (appt.notes.replace(/^Precio:[^\n]*\n?/m,'').replace(/^Opciones:[^\n]*\n?/, '').trim()) : ''

  const [form, setForm] = useState({
    barber_id: String(appt.barber_id ?? ''),
    service_id: initServiceId,
    date: initDate,
    slot: initSlot,
    notes: initExtra,
    customPrice: initCustomPrice,
  })
  const [selectedOptions, setSelectedOptions] = useState([])
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [fieldErrors, setFieldErrors] = useState({ barber_id: '', service_id: '', date: '', slot: '' })
  const didInitSlots = useRef(false)

  const selectedService = services.find(s => String(s.id) === String(form.service_id)) ?? null
  const activeOptions   = selectedService?.options?.filter(o => o.is_active) ?? []

  const toggleOption = (opt) =>
    setSelectedOptions(prev => prev.find(o => o.id === opt.id) ? prev.filter(o => o.id !== opt.id) : [...prev, opt])

  useEffect(() => {
    Promise.all([adminGetBarbers(), adminGetServices()])
      .then(([b, s]) => {
        setBarbers(b.data)
        setServices(s.data)
        if (!form.barber_id && b.data.length > 0)
          setForm(f => ({ ...f, barber_id: String(b.data[0].id) }))
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-select options once service list loads
  useEffect(() => {
    if (!services.length || !initOptNames.length) return
    const svc = services.find(s => String(s.id) === initServiceId)
    if (!svc?.options) return
    setSelectedOptions(svc.options.filter(o => initOptNames.includes(o.name)))
  }, [services]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!form.date || !form.barber_id || !form.service_id) return
    if (didInitSlots.current) setForm(f => ({ ...f, slot: null }))
    setLoadingSlots(true); setSlots([])
    getAvailability(form.date, form.barber_id, form.service_id, { excludeId: appt.id, showAll: true })
      .then(r => {
        const available = r.data.slots ?? []
        if (!didInitSlots.current) {
          const currentStart = initSlot.start.slice(0, 16)
          const currentSlot = available.find(s => s.start.replace(/([+-]\d{2}:\d{2}|Z)$/, '').slice(0, 16) === currentStart) ?? initSlot
          setForm(f => ({ ...f, slot: currentSlot }))
          didInitSlots.current = true
        }
        setSlots(available)
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [form.date, form.barber_id, form.service_id]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setFieldErrors(f => ({ ...f, [k]: '' }))
    if (k === 'service_id') setSelectedOptions([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = { service_id: '', date: '', slot: '' }
    const labels = []
    if (!form.service_id) { errors.service_id = 'Debes seleccionar un servicio'; labels.push('Servicio') }
    if (!form.date)       { errors.date = 'Debes elegir una fecha'; labels.push('Fecha') }
    if (!form.slot)       { errors.slot = 'Debes seleccionar una hora'; labels.push('Hora') }
    if (labels.length > 0) { setFieldErrors(errors); setError(`Corrige: ${labels.join(', ')}`); return }
    setSaving(true); setError('')
    try {
      const rawPrice = parseClp(form.customPrice)
      const parts = []
      if (rawPrice > 0) parts.push(`Precio: ${rawPrice}`)
      if (selectedOptions.length > 0) parts.push(`Opciones: ${selectedOptions.map(o => o.name).join(', ')}`)
      if (form.notes) parts.push(form.notes)
      const notes = parts.length > 0 ? parts.join('\n') : null
      await adminUpdateAppointment(appt.id, {
        barber_id: Number(form.barber_id),
        service_id: Number(form.service_id),
        start_datetime: form.slot.start,
        notes,
      })
      onSaved()
    } catch (err) {
      const detail = err.response?.data?.detail || 'Error al guardar la cita'
      const lower  = detail.toLowerCase()
      if (lower.includes('ocup') || lower.includes('horario') || lower.includes('conflict')) {
        setFieldErrors(f => ({ ...f, slot: detail })); setError(detail)
      } else setError(detail)
    } finally { setSaving(false) }
  }

  const inputCls = (field) =>
    'w-full bg-input border px-3 py-2 text-sm rounded-sm focus:outline-none transition-colors text-foreground ' +
    (fieldErrors[field] ? 'border-red-500 focus:border-red-400' : 'border-border focus:border-primary')
  const labelCls = "block text-muted-foreground text-xs uppercase tracking-wider mb-1.5"

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-light text-lg text-foreground">Editar cita — {appt.user?.name ?? '—'}</h3>
          <button onClick={onClose} className="text-xl leading-none text-muted-foreground hover:text-primary transition-colors">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 space-y-4">
          {error && <div className="bg-red-900/30 border border-red-800 text-red-400 text-xs px-3 py-2 rounded-sm">{error}</div>}

          <div>
            <label className={labelCls}>Servicio <span className="text-primary">*</span></label>
            <select className={inputCls('service_id')} value={form.service_id} onChange={e => set('service_id', e.target.value)}>
              <option value="">Seleccionar...</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} — {s.price_from ? 'Desde ' : ''}${s.price.toLocaleString()}</option>)}
            </select>
            {fieldErrors.service_id && <p className="text-red-400 text-xs mt-1">{fieldErrors.service_id}</p>}
          </div>

          {selectedService?.has_options && activeOptions.length > 0 && (
            <div>
              <label className={labelCls}>Opciones del servicio</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {activeOptions.map(opt => {
                  const checked = !!selectedOptions.find(o => o.id === opt.id)
                  return (
                    <button type="button" key={opt.id} onClick={() => toggleOption(opt)}
                      className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
                        checked ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground/30'
                      }`}>
                      {opt.name} — ${opt.price.toLocaleString()}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <label className={labelCls}>Fecha <span className="text-primary">*</span></label>
            <input type="date" className={inputCls('date')} value={form.date}
              onChange={e => set('date', e.target.value)} />
            {fieldErrors.date && <p className="text-red-400 text-xs mt-1">{fieldErrors.date}</p>}
          </div>

          {form.date && form.barber_id && form.service_id && (
            <div>
              <label className={labelCls}>Hora <span className="text-primary">*</span></label>
              {loadingSlots && <p className="text-muted-foreground text-xs">Cargando horarios...</p>}
              {!loadingSlots && slots.length === 0 && <p className="text-muted-foreground text-xs">No hay horas disponibles para esta fecha.</p>}
              {!loadingSlots && slots.length > 0 && (
                <div className={`grid grid-cols-4 sm:grid-cols-6 gap-1.5 mt-1 rounded-sm transition-colors ${fieldErrors.slot ? 'border border-red-500 p-2' : ''}`}>
                  {slots.map((slot, i) => {
                    const isSelected = form.slot && slot.start.replace(/([+-]\d{2}:\d{2}|Z)$/, '').slice(0, 16) === form.slot.start?.replace(/([+-]\d{2}:\d{2}|Z)$/, '').slice(0, 16)
                    return (
                      <button type="button" key={i}
                        disabled={!slot.available}
                        onClick={() => { if (slot.available) set('slot', slot) }}
                        className={`py-1.5 text-xs border rounded-sm transition-all ${
                          !slot.available
                            ? 'border-border/30 text-muted-foreground/30 line-through cursor-not-allowed'
                            : isSelected
                              ? 'bg-primary text-primary-foreground border-primary font-bold'
                              : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                        }`}>
                        {formatTime(slot.start)}
                      </button>
                    )
                  })}
                </div>
              )}
              {fieldErrors.slot && <p className="text-red-400 text-xs mt-1">{fieldErrors.slot}</p>}
            </div>
          )}

          <div>
            <label className={labelCls}>Precio personalizado <span className="text-muted-foreground normal-case tracking-normal font-normal">(opcional — solo si difiere del precio estándar)</span></label>
            <input
              type="text" inputMode="numeric"
              className={inputCls('customPrice')}
              value={form.customPrice}
              onChange={e => set('customPrice', e.target.value)}
              onBlur={e => { const n = parseClp(e.target.value); set('customPrice', n > 0 ? fmtClp(n) : '') }}
              placeholder="Ej: $45.000"
            />
          </div>

          <div>
            <label className={labelCls}>Notas</label>
            <textarea className={`${inputCls('notes')} resize-none`} rows={2} value={form.notes}
              onChange={e => set('notes', e.target.value)} placeholder="Indicaciones adicionales..." />
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-sm transition-colors hover:border-primary text-muted-foreground">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-gold disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Inline price editor ──────────────────────────────────────────────────────

function setNotePrice(notes, price) {
  const stripped = (notes ?? '').replace(/^Precio:\s*\d+\n?/m, '').trim()
  if (price > 0) return stripped ? `Precio: ${price}\n${stripped}` : `Precio: ${price}`
  return stripped || null
}

function InlinePriceCell({ appt, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue]     = useState('')
  const [saving, setSaving]   = useState(false)
  const inputRef = useRef(null)

  const current = calcTotal(appt)

  const start = () => {
    setValue(current != null && current > 0 ? String(current) : '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const cancel = () => { setEditing(false); setValue('') }

  const confirm = async () => {
    const price = parseClp(value)
    setSaving(true)
    try {
      await adminUpdateAppointment(appt.id, { notes: setNotePrice(appt.notes, price) })
      onSaved()
      setEditing(false)
    } catch { /* silencioso */ } finally { setSaving(false) }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={e => { if (!e.relatedTarget?.dataset?.priceAction) cancel() }}
          onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') cancel() }}
          className="w-24 bg-input border border-primary px-2 py-0.5 text-xs rounded-sm focus:outline-none text-foreground"
          placeholder="Ej: 45000"
        />
        <button data-price-action onClick={confirm} disabled={saving}
          className="text-green-400 hover:text-green-300 text-xs px-0.5">✓</button>
        <button data-price-action onClick={cancel}
          className="text-muted-foreground hover:text-foreground text-xs px-0.5">✕</button>
      </div>
    )
  }

  return (
    <button onClick={start} title="Click para editar precio"
      className="text-primary text-xs font-medium hover:opacity-70 transition-opacity group flex items-center gap-1">
      {fmtTotal(current)}
      <span className="opacity-0 group-hover:opacity-60 text-[10px] text-muted-foreground">✎</span>
    </button>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseNotes(notes) {
  if (!notes) return { options: [], extra: '' }
  const cleaned = notes.replace(/^Precio:\s*\d+\n?/m, '')
  const match = cleaned.match(/^Opciones:\s*(.+?)(\n([\s\S]*))?$/)
  if (!match) return { options: [], extra: cleaned.trim() }
  const options = match[1].split(',').map(s => s.trim()).filter(Boolean)
  const extra   = match[3]?.trim() ?? ''
  return { options, extra }
}

function parseTransferId(notes) {
  if (!notes) return null
  const match = notes.match(/Comprobante transferencia:\s*(.+?)(\n|$)/)
  return match ? match[1].trim() : null
}

function calcTotal(a) {
  if (a.notes) {
    const pm = a.notes.match(/(?:^|\n)Precio:\s*(\d+)/)
    if (pm) return parseInt(pm[1], 10)
  }
  const { options: optNames } = parseNotes(a.notes)
  const svcs = a.appointment_services?.length
    ? a.appointment_services.map(as_ => as_.service).filter(Boolean)
    : a.service ? [a.service] : []
  const allOptions = svcs.flatMap(sv => sv.options ?? [])
  const norm = s => s.trim().toLowerCase()

  // Pass 1: match option names extracted by parseNotes (admin "Opciones:" format)
  if (optNames.length > 0 && allOptions.length > 0) {
    const matched = optNames
      .map(name => allOptions.find(o => o.name === name) ?? allOptions.find(o => norm(o.name) === norm(name)))
      .filter(Boolean)
    if (matched.length > 0) return matched.reduce((s, o) => s + o.price, 0)
  }

  // Pass 2: fallback for old public-booking format "Service name: option, option"
  // Tokenise the notes (split on : , \n) and look for any token matching an option name
  if (allOptions.length > 0 && a.notes) {
    const tokens = a.notes
      .replace(/Comprobante transferencia:[^\n]*/g, '')
      .split(/[:,\n]+/)
      .map(s => s.trim())
      .filter(Boolean)
    const seen = new Map()
    for (const token of tokens) {
      const opt = allOptions.find(o => o.name === token) ?? allOptions.find(o => norm(o.name) === norm(token))
      if (opt && !seen.has(opt.id)) seen.set(opt.id, opt)
    }
    if (seen.size > 0) return [...seen.values()].reduce((s, o) => s + o.price, 0)
  }

  // price_from means real price depends on an option — don't show the misleading base price
  if (svcs.some(sv => sv.price_from)) return null
  return svcs.reduce((s, sv) => s + (sv?.price ?? 0), 0)
}

function fmtTotal(t) {
  return t !== null && t > 0 ? `$${t.toLocaleString()}` : '—'
}

// ── Appointment details modal ────────────────────────────────────────────────

function AppointmentDetailsModal({ appt, onClose }) {
  const { options, extra } = parseNotes(appt.notes)
  const realTotal = calcTotal(appt)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-light text-lg text-foreground">Detalle de la cita</h3>
          <button onClick={onClose} className="text-xl leading-none text-muted-foreground hover:text-primary transition-colors">×</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Cliente</p>
            <p className="text-foreground">{appt.user?.name ?? '—'}</p>
            <p className="text-muted-foreground text-xs">{appt.user?.email ?? ''}</p>
            {appt.user?.phone && <p className="text-muted-foreground text-xs">{appt.user.phone}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Fecha y hora</p>
              <p className="text-foreground text-sm">{fmtDt(appt.start_datetime, { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Estilista</p>
              <p className="text-foreground text-sm">{appt.barber?.name ?? '—'}</p>
            </div>
          </div>
          {/* Services — multi-service aware */}
          {(() => {
            const svcs = appt.appointment_services?.length
              ? appt.appointment_services.map(as_ => as_.service).filter(Boolean)
              : appt.service ? [appt.service] : []
            const total = svcs.reduce((s, sv) => s + (sv.price ?? 0), 0)
            return (
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">
                  {svcs.length > 1 ? 'Servicios' : 'Servicio'}
                </p>
                <div className="space-y-2">
                  {svcs.map((sv, i) => (
                    <div key={i} className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-foreground text-sm">{sv.name}</p>
                        <p className="text-muted-foreground text-xs">{sv.duration_minutes} min</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Total</p>
                    <p className="text-primary font-semibold">{fmtTotal(realTotal)}</p>
                  </div>
                  {svcs.length === 0 && <p className="text-foreground text-sm">—</p>}
                </div>
              </div>
            )
          })()}
          {options.length > 0 && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Opciones seleccionadas</p>
              <div className="flex flex-wrap gap-2">
                {options.map((opt, i) => (
                  <span key={i} className="text-xs px-3 py-1 bg-primary/10 border border-primary/40 text-primary rounded-sm">{opt}</span>
                ))}
              </div>
            </div>
          )}
          {extra && (
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Notas</p>
              <p className="text-foreground text-sm leading-relaxed">{extra}</p>
            </div>
          )}
          {options.length === 0 && !extra && <p className="text-muted-foreground text-sm italic">Sin notas adicionales</p>}
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end">
          <button onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded-sm transition-colors hover:border-primary text-muted-foreground">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter]             = useState('all')
  const [confirm, setConfirm]           = useState(null)
  const [showNew, setShowNew]           = useState(false)
  const [editAppt, setEditAppt]         = useState(null)
  const [detailAppt, setDetailAppt]     = useState(null)
  const [loading, setLoading]           = useState(true)

  const load = () => { setLoading(true); adminGetAppointments().then(r => setAppointments(r.data)).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const handleStatus = async (id, status) => {
    await adminUpdateApptStatus(id, status).catch(() => {})
    load()
  }

  const handleDelete = async () => {
    await adminDeleteAppointment(confirm).catch(() => {})
    setConfirm(null); load()
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-foreground">Citas</h1>
          <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mt-1">{appointments.length} citas en total</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex flex-wrap gap-2">
            {['all', ...STATUS_OPTIONS].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
                  filter === s ? 'border-primary text-primary bg-primary/5' : 'border-border text-muted-foreground hover:border-foreground/30'
                }`}>
                {s === 'all' ? 'Todas' : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
          <button onClick={() => setShowNew(true)} className="btn-gold text-xs py-1.5 self-start sm:self-auto">+ Nueva cita</button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card border border-border rounded-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-border">
              {['Fecha y hora', 'Cliente', 'Contacto', 'N° Transacción', 'Servicio', 'Valor', 'Estado', 'Acciones'].map(h => (
                <th key={h} className="text-left text-muted-foreground text-xs uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b border-border/50 hover:bg-foreground/5 transition-colors">
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                  {fmtDt(a.start_datetime, { dateStyle:'short', timeStyle:'short' })}
                </td>
                <td className="px-4 py-3 text-foreground font-medium">{a.user?.name ?? '—'}</td>
                <td className="px-4 py-3 text-xs">
                  <p className="text-muted-foreground">{a.user?.email ?? '—'}</p>
                  {a.user?.phone && <p className="text-muted-foreground">{a.user.phone}</p>}
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                  {parseTransferId(a.notes) ?? <span className="italic" style={{ fontFamily: 'inherit' }}>Sin comprobante</span>}
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const svcs = a.appointment_services?.length
                      ? a.appointment_services.map(as_ => as_.service).filter(Boolean)
                      : a.service ? [a.service] : []
                    return svcs.length > 0
                      ? <p className="text-muted-foreground">{svcs.map(s => s.name).join(', ')}</p>
                      : <p className="text-muted-foreground">—</p>
                  })()}
                  {parseNotes(a.notes).options.length > 0 && (
                    <button onClick={() => setDetailAppt(a)} className="text-primary text-xs hover:underline mt-0.5">Ver detalles</button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <InlinePriceCell appt={a} onSaved={load} />
                </td>
                <td className="px-4 py-3">
                  <select value={a.status} onChange={e => handleStatus(a.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border bg-transparent cursor-pointer focus:outline-none ${STATUS_COLORS[a.status]}`}>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s} className="bg-card text-foreground">{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 flex gap-3 items-center">
                  <button onClick={() => setEditAppt(a)} className="text-muted-foreground hover:text-primary transition-colors text-xs">Editar</button>
                  <button onClick={() => setConfirm(a.id)} className="text-muted-foreground hover:text-red-400 transition-colors text-xs">Eliminar</button>
                </td>
              </tr>
            ))}
            {loading && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-sm">Cargando citas...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-sm">No hay citas</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading && <p className="text-muted-foreground text-sm text-center py-8">Cargando citas...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">No hay citas</p>
        )}
        {filtered.map(a => (
          <div key={a.id} className="bg-card border border-border rounded-sm p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-foreground font-medium text-sm">{a.user?.name ?? '—'}</p>
                <p className="text-muted-foreground text-xs">{a.user?.email ?? '—'}</p>
                {a.user?.phone && <p className="text-muted-foreground text-xs">{a.user.phone}</p>}
              </div>
              <select value={a.status} onChange={e => handleStatus(a.id, e.target.value)}
                className={`text-xs px-2 py-1 rounded-full border bg-transparent cursor-pointer focus:outline-none ${STATUS_COLORS[a.status]}`}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s} className="bg-card text-foreground">{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50 text-xs">
              <div>
                <p className="text-muted-foreground uppercase tracking-wider" style={{fontSize:'9px'}}>Fecha</p>
                <p className="text-foreground mt-0.5">{fmtDt(a.start_datetime, { dateStyle:'short', timeStyle:'short' })}</p>
              </div>
              <div>
                <p className="text-muted-foreground uppercase tracking-wider" style={{fontSize:'9px'}}>Servicio</p>
                {(() => {
                  const svcs = a.appointment_services?.length
                    ? a.appointment_services.map(as_ => as_.service).filter(Boolean)
                    : a.service ? [a.service] : []
                  return (
                    <>
                      <p className="text-foreground mt-0.5">{svcs.length ? svcs.map(s => s.name).join(', ') : '—'}</p>
                      {parseNotes(a.notes).options.length > 0 && (
                        <button onClick={() => setDetailAppt(a)} className="text-primary text-xs hover:underline mt-0.5">Ver detalles</button>
                      )}
                    </>
                  )
                })()}
              </div>
              <div>
                <p className="text-muted-foreground uppercase tracking-wider" style={{fontSize:'9px'}}>Valor</p>
                <div className="mt-0.5"><InlinePriceCell appt={a} onSaved={load} /></div>
              </div>
              <div>
                <p className="text-muted-foreground uppercase tracking-wider" style={{fontSize:'9px'}}>Transacción</p>
                <p className="text-muted-foreground mt-0.5 truncate">{parseTransferId(a.notes) ?? '—'}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/50 flex justify-end gap-4">
              <button onClick={() => setEditAppt(a)} className="text-muted-foreground hover:text-primary transition-colors text-xs">Editar</button>
              <button onClick={() => setConfirm(a.id)} className="text-muted-foreground hover:text-red-400 transition-colors text-xs">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {showNew && <NewAppointmentModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load() }} />}
      {editAppt && <EditAppointmentModal appt={editAppt} onClose={() => setEditAppt(null)} onSaved={() => { setEditAppt(null); load() }} />}
      {confirm && <ConfirmModal message="¿Eliminar esta cita permanentemente?" onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      {detailAppt && <AppointmentDetailsModal appt={detailAppt} onClose={() => setDetailAppt(null)} />}
    </div>
  )
}
