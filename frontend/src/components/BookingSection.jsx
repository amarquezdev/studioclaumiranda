import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { getServices, getBarbers, getBusinessHours, getAvailability, guestCreateAppointment } from '../api/client'
import { cn } from '../lib/utils'

// ── Helpers ────────────────────────────────────────────────────────────────

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function toISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('es-CL', { hour:'2-digit', minute:'2-digit', hour12:false })
}

// ── Step indicator ─────────────────────────────────────────────────────────
// Steps are: 1=Servicio, 1.5=Opciones (conditional), 3=Fecha, 4=Hora, 5=Tus datos

function Steps({ current, hasOptions }) {
  const steps = hasOptions
    ? ['Servicio', 'Opciones', 'Fecha', 'Hora', 'Tus datos']
    : ['Servicio', 'Fecha', 'Hora', 'Tus datos']

  // Map internal step numbers (skip 2) to visual index
  const visualCurrent = hasOptions
    ? current <= 1 ? 1 : current === 1.5 ? 2 : current - 1
    : current <= 1 ? 1 : current - 2

  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((label, i) => {
        const n    = i + 1
        const done = n < visualCurrent
        const active = n === visualCurrent
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-8 h-8 flex items-center justify-center text-xs border transition-all duration-200',
                active ? 'bg-primary border-primary text-primary-foreground'
                  : done ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-card border-border text-muted-foreground'
              )}>
                {done ? <Check className="w-3.5 h-3.5" /> : n}
              </div>
              <span className={cn(
                'text-xs mt-1.5 tracking-wider uppercase hidden sm:block',
                active ? 'text-primary' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'w-10 sm:w-16 h-px mx-1 mb-5 transition-colors duration-200',
                done ? 'bg-primary' : 'bg-border'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Calendar ───────────────────────────────────────────────────────────────

function Calendar({ businessHours, selected, onSelect }) {
  const [month, setMonth] = useState(new Date())
  const today = new Date(); today.setHours(0,0,0,0)

  const year     = month.getFullYear()
  const monthIdx = month.getMonth()
  const firstDow = (new Date(year, monthIdx, 1).getDay() + 6) % 7
  const lastDay  = new Date(year, monthIdx+1, 0).getDate()

  const openDows = new Set(businessHours.filter(h => h.is_open).map(h => h.day_of_week))
  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, monthIdx, d)
    const dow  = (date.getDay() + 6) % 7
    cells.push({ date, open: openDows.has(dow), past: date < today })
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setMonth(new Date(year, monthIdx-1, 1))}
          className="text-muted-foreground hover:text-foreground transition-colors w-8 h-8 flex items-center justify-center border border-border hover:border-primary">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-foreground tracking-wider uppercase text-sm">
          {MONTHS[monthIdx]} {year}
        </span>
        <button onClick={() => setMonth(new Date(year, monthIdx+1, 1))}
          className="text-muted-foreground hover:text-foreground transition-colors w-8 h-8 flex items-center justify-center border border-border hover:border-primary">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-2">
        {['Lu','Ma','Mi','Ju','Vi','Sá','Do'].map(d => (
          <div key={d} className="text-center text-muted-foreground text-xs py-1 tracking-wider">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />
          const iso        = toISO(cell.date)
          const isSelected = selected === iso
          const disabled   = cell.past || !cell.open
          return (
            <button key={i} disabled={disabled} onClick={() => onSelect(iso)}
              className={cn(
                'aspect-square text-sm flex items-center justify-center transition-all duration-150',
                isSelected ? 'bg-primary text-primary-foreground font-medium'
                  : disabled ? 'text-muted cursor-not-allowed'
                  : 'text-foreground hover:bg-card hover:text-primary cursor-pointer border border-border hover:border-primary'
              )}>
              {cell.date.getDate()}
            </button>
          )
        })}
      </div>
      <p className="text-muted-foreground text-xs text-center mt-4 tracking-wider">
        Solo días con atención disponible
      </p>
    </div>
  )
}

// ── Input helper ───────────────────────────────────────────────────────────

function Field({ label, type='text', value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-2">
        {label}{required && <span className="text-primary ml-1">*</span>}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        required={required} placeholder={placeholder}
        className="w-full bg-input border border-border text-foreground px-4 py-3 text-sm
                   focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
      />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function BookingSection() {
  const [step, setStep] = useState(1)
  const [services, setServices]           = useState([])
  const [barbers,  setBarbers]            = useState([])
  const [businessHours, setBusinessHours] = useState([])
  const [slots,    setSlots]              = useState([])
  const [loading,  setLoading]            = useState(false)
  const [error,    setError]              = useState('')

  const [selectedService, setSelectedService]   = useState(null)
  const [selectedOptions, setSelectedOptions]   = useState([])   // list of ServiceOption objects
  const [selectedBarber,  setSelectedBarber]    = useState(null)
  const [selectedDate,    setSelectedDate]      = useState(null)
  const [selectedSlot,    setSelectedSlot]      = useState(null)
  const [booked,          setBooked]            = useState(false)

  const [guestName,   setGuestName]   = useState('')
  const [guestEmail,  setGuestEmail]  = useState('')
  const [guestPhone,  setGuestPhone]  = useState('')
  const [guestNotes,  setGuestNotes]  = useState('')
  const [transferId,  setTransferId]  = useState('')
  const [copiedField, setCopiedField] = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  const copyToClipboard = (label, value) => {
    navigator.clipboard.writeText(value)
    setCopiedField(label)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const toggleOption = (opt) => {
    setSelectedOptions(prev =>
      prev.find(o => o.id === opt.id)
        ? prev.filter(o => o.id !== opt.id)
        : [...prev, opt]
    )
  }

  const optionsPrice = selectedOptions.reduce((sum, o) => sum + o.price, 0)

  useEffect(() => {
    Promise.all([getServices(), getBarbers(), getBusinessHours()])
      .then(([s, b, h]) => {
        setServices(s.data)
        setBarbers(b.data)
        setBusinessHours(h.data)
        // Auto-seleccionar la única estilista activa
        const active = b.data.find(x => x.is_active) ?? b.data[0]
        if (active) setSelectedBarber(active)
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
  }, [])

  useEffect(() => {
    if (!selectedDate || !selectedService || !selectedBarber) return
    setLoading(true); setSlots([])
    getAvailability(selectedDate, selectedBarber.id, selectedService.id)
      .then(r => setSlots(r.data.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }, [selectedDate, selectedBarber, selectedService])

  const handleConfirm = async (e) => {
    e.preventDefault()
    if (selectedService?.deposit_amount > 0 && !transferId.trim()) {
      setError('Debes ingresar el número de comprobante de la transferencia.')
      return
    }
    setSubmitting(true); setError('')
    try {
      let notes = guestNotes || null
      if (selectedOptions.length > 0) {
        const optLine = `Opciones: ${selectedOptions.map(o => o.name).join(', ')}`
        notes = notes ? `${optLine}\n${notes}` : optLine
      }
      if (selectedService?.deposit_amount > 0 && transferId.trim()) {
        const tLine = `Comprobante transferencia: ${transferId.trim()}`
        notes = notes ? `${notes}\n${tLine}` : tLine
      }
      await guestCreateAppointment({
        name: guestName, email: guestEmail,
        phone: guestPhone || null,
        barber_id:  selectedBarber.id,
        service_id: selectedService.id,
        start_datetime: selectedSlot.start,
        notes,
      })
      setBooked(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al reservar. Intenta nuevamente.')
    } finally { setSubmitting(false) }
  }

  const reset = () => {
    setBooked(false); setStep(1)
    setSelectedService(null); setSelectedOptions([]); setSelectedBarber(null)
    setSelectedDate(null); setSelectedSlot(null)
    setGuestName(''); setGuestEmail(''); setGuestPhone(''); setGuestNotes(''); setTransferId('')
  }

  // ── Confirmación ──────────────────────────────────────────────────────────
  if (booked) {
    return (
      <section id="reservar" className="py-24 px-6 lg:px-12 bg-secondary">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-8">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-light text-foreground tracking-wide mb-3">
            ¡Cita confirmada!
          </h2>
          <p className="text-muted-foreground mb-1">
            Hola <span className="text-foreground">{guestName}</span>, tu reserva está lista.
          </p>
          <p className="text-muted-foreground mb-1">
            <span className="text-primary">{selectedService?.name}</span>
          </p>
          {selectedOptions.length > 0 && (
            <p className="text-muted-foreground text-sm mb-1">
              {selectedOptions.map(o => o.name).join(', ')}
            </p>
          )}
          <p className="text-muted-foreground mb-8">
            {selectedDate} a las <span className="text-primary">{formatTime(selectedSlot.start)}</span>
          </p>
          {selectedService?.deposit_amount > 0 && (
            <p className="text-muted-foreground text-sm mb-1">
              Abono registrado: <span className="text-primary font-medium">
                ${Math.round(selectedService.deposit_amount).toLocaleString('es-CL')}
              </span>
            </p>
          )}
          <p className="text-muted-foreground text-xs mb-8 tracking-wider">
            Confirmación enviada a {guestEmail}
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-sm tracking-wider uppercase hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            Reservar otra cita
          </button>
        </div>
      </section>
    )
  }

  // ── Booking form ──────────────────────────────────────────────────────────
  return (
    <section id="reservar" className="py-24 px-6 lg:px-12 bg-secondary">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-14">
          <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4">Agenda en línea</p>
          <h2 className="text-4xl md:text-5xl font-light text-foreground tracking-wide">
            Reserva tu <span className="italic">Cita</span>
          </h2>
        </div>

        {error && (
          <div className="border border-red-700/40 bg-red-900/10 text-red-400 text-sm px-4 py-3 mb-8 text-center">
            {error}
          </div>
        )}

        <Steps current={step} hasOptions={selectedService?.has_options} />

        {/* ── Paso 1: Servicio ── */}
        {step === 1 && (
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] text-center mb-8">
              Elige un servicio
            </p>
            {services.length === 0 && !error && (
              <p className="text-muted-foreground text-sm text-center">Cargando servicios...</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {services.map(s => (
                <button key={s.id} onClick={() => {
                  setSelectedService(s)
                  setSelectedOptions([])
                  setStep(s.has_options ? 1.5 : 3)
                }}
                  className={cn(
                    'bg-card border p-6 text-left transition-all duration-200 hover:border-primary/60 group',
                    selectedService?.id === s.id ? 'border-primary' : 'border-border'
                  )}>
                  <div className="w-6 h-px bg-primary mb-4" />
                  <h4 className="text-foreground font-light text-lg tracking-wide group-hover:text-primary transition-colors">
                    {s.name}
                  </h4>
                  {s.description && (
                    <p className="text-muted-foreground text-xs leading-relaxed mt-2">{s.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <span className="text-muted-foreground text-xs tracking-wider">{s.duration_minutes} min</span>
                    <span className="text-primary font-medium">
                      {s.price_from && <span className="text-xs font-normal mr-0.5">Desde </span>}
                      ${s.price.toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Paso 1.5: Opciones (solo cuando has_options) ── */}
        {step === 1.5 && selectedService && (
          <div className="max-w-lg mx-auto">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] text-center mb-2">
              Personaliza tu servicio
            </p>
            <p className="text-primary text-sm text-center mb-8 tracking-wider">
              {selectedService.name}
            </p>

            <div className="space-y-3">
              {selectedService.options?.filter(o => o.is_active).map(opt => {
                const checked = !!selectedOptions.find(o => o.id === opt.id)
                return (
                  <button key={opt.id} type="button" onClick={() => toggleOption(opt)}
                    className={cn(
                      'w-full flex items-center justify-between px-5 py-4 border text-left transition-all duration-150',
                      checked ? 'bg-primary/10 border-primary' : 'bg-card border-border hover:border-primary/60'
                    )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-4 h-4 border flex items-center justify-center shrink-0 transition-colors',
                        checked ? 'bg-primary border-primary' : 'border-border'
                      )}>
                        {checked && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </div>
                      <span className={cn(
                        'text-sm tracking-wide transition-colors',
                        checked ? 'text-foreground' : 'text-muted-foreground'
                      )}>{opt.name}</span>
                    </div>
                    <span className="text-primary font-medium text-sm">
                      {opt.price_from && <span className="text-xs font-normal mr-0.5">desde </span>}
                      ${opt.price.toLocaleString()}
                    </span>
                  </button>
                )
              })}
            </div>

            {selectedOptions.length > 0 && (
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-muted-foreground text-xs uppercase tracking-wider">Total opciones</span>
                <span className="text-primary font-medium">${optionsPrice.toLocaleString()}</span>
              </div>
            )}

            <button
              onClick={() => { if (selectedOptions.length > 0) setStep(3) }}
              disabled={selectedOptions.length === 0}
              className={cn(
                'mt-6 w-full py-3 text-sm tracking-wider uppercase transition-all duration-200',
                selectedOptions.length > 0
                  ? 'bg-foreground text-background hover:bg-primary hover:text-primary-foreground cursor-pointer'
                  : 'bg-card text-muted-foreground border border-border cursor-not-allowed'
              )}>
              {selectedOptions.length === 0 ? 'Selecciona al menos una opción' : 'Continuar'}
            </button>

            <button onClick={() => { setSelectedService(null); setStep(1) }}
              className="mt-4 flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider transition-colors mx-auto">
              <ChevronLeft className="w-3 h-3" /> Volver
            </button>
          </div>
        )}

        {/* ── Paso 3: Fecha ── */}
        {step === 3 && (
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] text-center mb-8">
              Elige una fecha
            </p>
            <Calendar businessHours={businessHours} selected={selectedDate}
              onSelect={date => { setSelectedDate(date); setStep(4) }} />
            <button onClick={() => setStep(selectedService?.has_options ? 1.5 : 1)}
              className="mt-8 flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider transition-colors mx-auto">
              <ChevronLeft className="w-3 h-3" /> Volver
            </button>
          </div>
        )}

        {/* ── Paso 4: Hora ── */}
        {step === 4 && (
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] text-center mb-2">
              Elige una hora
            </p>
            <p className="text-primary text-sm text-center mb-8 tracking-wider">{selectedDate}</p>
            {loading && (
              <p className="text-muted-foreground text-sm text-center">Cargando horarios disponibles...</p>
            )}
            {!loading && slots.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-6">
                No hay horas disponibles para esta fecha.{' '}
                <button onClick={() => setStep(3)} className="text-primary hover:underline">
                  Elige otra fecha
                </button>
              </p>
            )}
            {!loading && slots.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-md mx-auto">
                {slots.map((slot, i) => (
                  <button key={i} onClick={() => { setSelectedSlot(slot); setStep(5) }}
                    className={cn(
                      'py-2.5 text-sm border transition-all duration-150 tracking-wider',
                      selectedSlot === slot
                        ? 'bg-primary text-primary-foreground border-primary font-medium'
                        : 'border-border text-foreground hover:border-primary hover:text-primary'
                    )}>
                    {formatTime(slot.start)}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setStep(3)}
              className="mt-8 flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider transition-colors mx-auto">
              <ChevronLeft className="w-3 h-3" /> Volver
            </button>
          </div>
        )}

        {/* ── Paso 5: Datos personales + Abono ── */}
        {step === 5 && (
          <div className="max-w-md mx-auto">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] text-center mb-2">
              Tus datos
            </p>
            <p className="text-primary text-xs text-center mb-2 tracking-wider">
              {selectedService?.name} · {selectedDate}
              {selectedSlot && ` · ${formatTime(selectedSlot.start)}`}
            </p>
            {selectedOptions.length > 0 && (
              <p className="text-muted-foreground text-xs text-center mb-8 tracking-wider">
                {selectedOptions.map(o => o.name).join(' · ')}
                {' — '}
                <span className="text-primary">${optionsPrice.toLocaleString()}</span>
              </p>
            )}
            {selectedOptions.length === 0 && <div className="mb-8" />}

            <form onSubmit={handleConfirm} className="space-y-4">
              <Field label="Nombre completo" value={guestName} onChange={setGuestName} required placeholder="Juan Pérez" />
              <Field label="Email" type="email" value={guestEmail} onChange={setGuestEmail} required placeholder="juan@email.com" />
              <Field label="Teléfono" type="tel" value={guestPhone} onChange={setGuestPhone} placeholder="+56 9 1234 5678" />
              <div>
                <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-2">
                  Notas (opcional)
                </label>
                <textarea value={guestNotes} onChange={e => setGuestNotes(e.target.value)} rows={2}
                  placeholder="Alguna indicación para la estilista..."
                  className="w-full bg-input border border-border text-foreground px-4 py-3 text-sm
                             focus:outline-none focus:border-primary transition-colors resize-none
                             placeholder:text-muted-foreground" />
              </div>

              {/* ── Sección abono (solo si el servicio lo requiere) ── */}
              {selectedService?.deposit_amount > 0 && (
                <div className="space-y-3 pt-2">
                  {/* Banner monto */}
                  <div className="flex items-center justify-between px-5 py-4"
                    style={{ background: 'var(--secondary)', borderLeft: '3px solid var(--primary)' }}>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wider">Abono requerido</p>
                      <p className="text-foreground text-xs mt-0.5">Realiza la transferencia antes de confirmar</p>
                    </div>
                    <span className="text-primary font-medium text-xl">
                      ${Math.round(selectedService.deposit_amount).toLocaleString('es-CL')}
                    </span>
                  </div>

                  {/* Datos bancarios */}
                  <div className="border border-border">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider px-4 py-3 border-b border-border">
                      Datos para transferencia
                    </p>
                    {[
                      { label: 'Titular',        value: 'Claudia Miranda Castro' },
                      { label: 'RUT',            value: '15.390.856-7' },
                      { label: 'Banco',          value: 'Banco Estado' },
                      { label: 'Tipo de cuenta', value: 'Cuenta Vista / Cuenta RUT' },
                      { label: 'N° de cuenta',   value: '15390856' },
                      { label: 'Email',          value: 'studioclaumiranda@gmail.com' },
                    ].map(({ label, value }) => (
                      <div key={label}
                        className="flex items-center justify-between px-4 py-2.5 border-b border-border last:border-0">
                        <div>
                          <p className="text-muted-foreground text-xs">{label}</p>
                          <p className="text-foreground text-sm font-medium">{value}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(label, value)}
                          className="text-xs px-3 py-1.5 border border-border hover:border-primary
                                     text-muted-foreground hover:text-primary transition-colors shrink-0 ml-3">
                          {copiedField === label ? '✓ Copiado' : 'Copiar'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Campo comprobante */}
                  <div>
                    <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-2">
                      N° de comprobante / ID de transferencia <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={transferId}
                      onChange={e => setTransferId(e.target.value)}
                      placeholder="Ej: 123456789"
                      className="w-full bg-input border border-border text-foreground px-4 py-3 text-sm
                                 focus:outline-none focus:border-primary transition-colors
                                 placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              )}

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button type="submit"
                disabled={submitting || (selectedService?.deposit_amount > 0 && !transferId.trim())}
                className="w-full bg-foreground text-background py-4 text-sm tracking-wider uppercase
                           hover:bg-primary hover:text-primary-foreground transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Confirmando...' : 'Confirmar Reserva'}
              </button>
            </form>

            <button onClick={() => setStep(4)}
              className="mt-6 flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider transition-colors mx-auto">
              <ChevronLeft className="w-3 h-3" /> Volver
            </button>
          </div>
        )}

      </div>
    </section>
  )
}
