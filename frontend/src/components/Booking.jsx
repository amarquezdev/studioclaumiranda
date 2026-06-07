import { useState, useEffect } from 'react'
import { Scissors, Sparkles, Palette, Droplets, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { getServices, getBarbers, getBusinessHours, getAvailability, guestCreateAppointment, getBlockedDates } from '../api/client'
import { cn } from '../lib/utils'

// ── Helpers ────────────────────────────────────────────────────────────────

const SERVICE_ICONS = [Scissors, Palette, Droplets, Sparkles]
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function toISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('es-CL', { hour:'2-digit', minute:'2-digit', hour12:false })
}

// ── Step indicator ─────────────────────────────────────────────────────────

function Steps({ current, hasOptions, hasDeposit }) {
  const steps = hasOptions
    ? ['Servicio', 'Opciones', 'Fecha', 'Hora', 'Tus datos', ...(hasDeposit ? ['Pago'] : [])]
    : ['Servicio', 'Fecha', 'Hora', 'Tus datos', ...(hasDeposit ? ['Pago'] : [])]

  const visualCurrent = hasOptions
    ? current <= 1 ? 1 : current === 1.5 ? 2 : current
    : current <= 1 ? 1 : current - 1

  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((label, i) => {
        const n = i + 1
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

function Calendar({ businessHours, blockedDates, selected, onSelect }) {
  const [month, setMonth] = useState(new Date())
  const today = new Date(); today.setHours(0,0,0,0)

  const year     = month.getFullYear()
  const monthIdx = month.getMonth()
  const firstDow = (new Date(year, monthIdx, 1).getDay() + 6) % 7
  const lastDay  = new Date(year, monthIdx+1, 0).getDate()

  const openDows = new Set(businessHours.filter(h => h.is_open).map(h => h.day_of_week))
  const isBlocked = (iso) => blockedDates.some(b => iso >= b.date_from && iso <= b.date_to)

  const cells = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, monthIdx, d)
    const dow  = (date.getDay() + 6) % 7
    const iso  = toISO(date)
    cells.push({ date, open: openDows.has(dow), past: date < today, blocked: isBlocked(iso) })
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
          const iso = toISO(cell.date)
          const isSelected = selected === iso
          const disabled = cell.past || !cell.open || cell.blocked
          return (
            <button key={i} disabled={disabled} onClick={() => onSelect(iso)}
              className={cn(
                'aspect-square text-sm flex items-center justify-center transition-all duration-150',
                isSelected
                  ? 'bg-primary text-primary-foreground font-medium'
                  : cell.blocked && !cell.past
                  ? 'bg-red-500/8 border border-red-400/30 text-red-400 cursor-not-allowed'
                  : disabled
                  ? 'text-muted cursor-not-allowed'
                  : 'text-foreground hover:bg-card hover:text-primary cursor-pointer border border-border hover:border-primary'
              )}>
              {cell.date.getDate()}
            </button>
          )
        })}
      </div>
      <div className="flex items-center justify-center gap-5 mt-4">
        <p className="text-muted-foreground text-xs tracking-wider">Sin atención = gris</p>
        <p className="text-red-400 text-xs tracking-wider flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
          Bloqueado = rojo
        </p>
      </div>
    </div>
  )
}

// ── Field ──────────────────────────────────────────────────────────────────

function Field({ label, type='text', value, onChange, required, placeholder }) {
  return (
    <div>
      <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-2">
        {label}{required && <span className="text-primary ml-1">*</span>}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        required={required} placeholder={placeholder}
        className="w-full bg-card border border-border text-foreground px-4 py-3 text-sm
                   focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
      />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function Booking() {
  const [step, setStep]                     = useState(1)
  const [services, setServices]             = useState([])
  const [barbers, setBarbers]               = useState([])
  const [businessHours, setBusinessHours]   = useState([])
  const [slots, setSlots]                   = useState([])
  const [blockedDates, setBlockedDates]     = useState([])
  const [loadingInit, setLoadingInit]       = useState(true)
  const [loadingSlots, setLoadingSlots]     = useState(false)
  const [error, setError]                   = useState('')

  const [selectedService, setSelectedService] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [selectedBarber, setSelectedBarber]   = useState(null)
  const [selectedDate, setSelectedDate]       = useState(null)
  const [selectedSlot, setSelectedSlot]       = useState(null)
  const [booked, setBooked]                   = useState(false)

  const [guestFirstName, setGuestFirstName] = useState('')
  const [guestLastName,  setGuestLastName]  = useState('')
  const [guestEmail,  setGuestEmail]   = useState('')
  const [guestPhone,  setGuestPhone]   = useState('')
  const [guestNotes,  setGuestNotes]   = useState('')
  const [transferId,  setTransferId]   = useState('')
  const [copiedAll,   setCopiedAll]    = useState(false)
  const [submitting,  setSubmitting]   = useState(false)

  useEffect(() => {
    Promise.all([getServices(), getBarbers(), getBusinessHours(), getBlockedDates()])
      .then(([s, b, h, bd]) => {
        setServices(s.data)
        setBarbers(b.data)
        setBusinessHours(h.data)
        setBlockedDates(bd.data)
        const active = b.data.find(x => x.is_active) ?? b.data[0]
        if (active) setSelectedBarber(active)
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoadingInit(false))
  }, [])

  useEffect(() => {
    if (!selectedDate || !selectedService || !selectedBarber) return
    setLoadingSlots(true); setSlots([])
    getAvailability(selectedDate, selectedBarber.id, selectedService.id)
      .then(r => setSlots(r.data.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate, selectedBarber, selectedService])

  const toggleOption = (opt) => {
    setSelectedOptions(prev =>
      prev.find(o => o.id === opt.id) ? prev.filter(o => o.id !== opt.id) : [...prev, opt]
    )
  }

  const optionsPrice = selectedOptions.reduce((sum, o) => sum + o.price, 0)

  const copyAllBankData = () => {
    navigator.clipboard.writeText(
      `Claudia Miranda Castro\n 15.390.856-7\nBanco Estado\nCuenta Vista / Cuenta RUT\n15390856\nstudioclaumiranda@gmail.com\n`
    )
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const doConfirm = async () => {
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
        name: `${guestFirstName.trim()} ${guestLastName.trim()}`,
        email: guestEmail,
        phone: guestPhone.trim() ? `+56 9 ${guestPhone.trim()}` : null,
        barber_id: selectedBarber.id,
        service_id: selectedService.id,
        start_datetime: selectedSlot.start,
        notes,
      })
      setBooked(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al reservar. Intenta nuevamente.')
    } finally { setSubmitting(false) }
  }

  const handleStep5 = (e) => {
    e.preventDefault()
    setError('')
    if (selectedService?.deposit_amount > 0) setStep(6)
    else doConfirm()
  }

  const reset = () => {
    setBooked(false); setStep(1)
    setSelectedService(null); setSelectedOptions([])
    setSelectedDate(null); setSelectedSlot(null)
    setGuestFirstName(''); setGuestLastName('')
    setGuestEmail(''); setGuestPhone(''); setGuestNotes(''); setTransferId('')
    setError('')
  }

  // ── Confirmación ──────────────────────────────────────────────────────────
  if (booked) {
    return (
      <section id="book" className="bg-background">
        <div className="mx-auto max-w-lg px-6 py-24 text-center md:py-32">
          <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-8">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl italic text-foreground mb-3">¡Cita confirmada!</h2>
          <p className="text-muted-foreground mb-1">
            Hola <span className="text-foreground">{guestFirstName}</span>, tu reserva está lista.
          </p>
          <p className="text-muted-foreground mb-1">
            <span className="text-primary">{selectedService?.name}</span>
          </p>
          {selectedOptions.length > 0 && (
            <p className="text-muted-foreground text-sm mb-1">{selectedOptions.map(o => o.name).join(', ')}</p>
          )}
          <p className="text-muted-foreground mb-8">
            {selectedDate} a las <span className="text-primary">{formatTime(selectedSlot.start)}</span>
          </p>
          {selectedService?.deposit_amount > 0 && (
            <p className="text-muted-foreground text-sm mb-1">
              Abono registrado:{' '}
              <span className="text-primary font-medium">
                ${Math.round(selectedService.deposit_amount).toLocaleString('es-CL')}
              </span>
            </p>
          )}
          <p className="text-muted-foreground text-xs mb-8 tracking-wider">
            Confirmación enviada a {guestEmail}
          </p>
          <button onClick={reset}
            className="bg-primary text-primary-foreground px-8 py-4 text-[11px] tracking-[0.2em] uppercase hover:opacity-90 transition-opacity">
            Reservar otra cita
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="book" className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">

        {/* ── Paso 1: encabezado Evnia + tarjetas ── */}
        {step === 1 && (
          <>
            <div className="mb-14 text-center">
              <p className="text-[11px] tracking-[0.3em] text-foreground/50">RESERVA</p>
              <h2 className="mt-4 font-serif text-4xl italic text-foreground md:text-5xl text-balance">
                Elige tu Servicio
              </h2>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center mb-8">{error}</p>
            )}

            {loadingInit ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col border border-border bg-card p-8 animate-pulse">
                    <div className="size-7 rounded bg-muted" />
                    <div className="mt-6 h-6 w-3/4 rounded bg-muted" />
                    <div className="mt-3 flex-1 space-y-2">
                      <div className="h-3 rounded bg-muted" />
                      <div className="h-3 w-5/6 rounded bg-muted" />
                    </div>
                    <div className="mt-6 h-10 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {services.map((s, i) => {
                  const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length]
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedService(s)
                        setSelectedOptions([])
                        setStep(s.has_options ? 1.5 : 3)
                      }}
                      className="group flex flex-col border border-border bg-card p-8 text-left transition-colors hover:bg-accent hover:border-primary/60"
                    >
                      <Icon className="size-7 text-foreground/80" strokeWidth={1.25} />
                      <h3 className="mt-6 font-serif text-2xl text-foreground group-hover:text-primary transition-colors">
                        {s.name}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs tracking-wide text-foreground/70">
                        <span>
                          {s.price_from && <span className="mr-0.5">Desde </span>}
                          ${s.price.toLocaleString('es-CL')}
                        </span>
                        <span>{s.duration_minutes} min</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── Pasos 2+: indicador + contenido ── */}
        {step !== 1 && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-14 text-center">
              <p className="text-[11px] tracking-[0.3em] text-foreground/50">RESERVA</p>
              <h2 className="mt-4 font-serif text-4xl italic text-foreground md:text-5xl">
                Reserva tu Cita
              </h2>
            </div>

            {error && (
              <div className="border border-red-400/40 bg-red-50 text-red-500 text-sm px-4 py-3 mb-8 text-center rounded-sm">
                {error}
              </div>
            )}

            <Steps
              current={step}
              hasOptions={selectedService?.has_options}
              hasDeposit={selectedService?.deposit_amount > 0}
            />

            {/* Paso 1.5: Opciones */}
            {step === 1.5 && selectedService && (
              <div className="max-w-lg mx-auto">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] text-center mb-2">
                  Personaliza tu servicio
                </p>
                <p className="text-primary text-sm text-center mb-8 tracking-wider">{selectedService.name}</p>
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
                          <span className={cn('text-sm tracking-wide', checked ? 'text-foreground' : 'text-muted-foreground')}>
                            {opt.name}
                          </span>
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
                    'mt-6 w-full py-3 text-[11px] tracking-[0.2em] uppercase transition-all duration-200',
                    selectedOptions.length > 0
                      ? 'bg-primary text-primary-foreground hover:opacity-90 cursor-pointer'
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

            {/* Paso 3: Fecha */}
            {step === 3 && (
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] text-center mb-8">
                  Elige una fecha
                </p>
                <Calendar
                  businessHours={businessHours}
                  blockedDates={blockedDates}
                  selected={selectedDate}
                  onSelect={date => { setSelectedDate(date); setStep(4) }}
                />
                <button onClick={() => setStep(selectedService?.has_options ? 1.5 : 1)}
                  className="mt-8 flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider transition-colors mx-auto">
                  <ChevronLeft className="w-3 h-3" /> Volver
                </button>
              </div>
            )}

            {/* Paso 4: Hora */}
            {step === 4 && (
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] text-center mb-2">
                  Elige una hora
                </p>
                <p className="text-primary text-sm text-center mb-8 tracking-wider">{selectedDate}</p>
                {loadingSlots && (
                  <p className="text-muted-foreground text-sm text-center">Cargando horarios disponibles...</p>
                )}
                {!loadingSlots && slots.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-6">
                    No hay horas disponibles para esta fecha.{' '}
                    <button onClick={() => setStep(3)} className="text-primary hover:underline">
                      Elige otra fecha
                    </button>
                  </p>
                )}
                {!loadingSlots && slots.length > 0 && (
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

            {/* Paso 5: Datos personales */}
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

                <form onSubmit={handleStep5} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nombre" value={guestFirstName} onChange={setGuestFirstName} required placeholder="Juan" />
                    <Field label="Apellido" value={guestLastName} onChange={setGuestLastName} required placeholder="Pérez" />
                  </div>
                  <Field label="Email" type="email" value={guestEmail} onChange={setGuestEmail} required placeholder="juan@email.com" />
                  <div>
                    <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-2">Teléfono</label>
                    <div className="flex">
                      <span className="bg-muted border border-border border-r-0 px-4 py-3 text-sm text-muted-foreground select-none whitespace-nowrap">
                        +56 9
                      </span>
                      <input
                        type="tel"
                        value={guestPhone}
                        onChange={e => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="12345678"
                        maxLength={8}
                        className="flex-1 bg-card border border-border text-foreground px-4 py-3 text-sm
                                   focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-2">
                      Notas (opcional)
                    </label>
                    <textarea value={guestNotes} onChange={e => setGuestNotes(e.target.value)} rows={2}
                      placeholder="Alguna indicación para la estilista..."
                      className="w-full bg-card border border-border text-foreground px-4 py-3 text-sm
                                 focus:outline-none focus:border-primary transition-colors resize-none
                                 placeholder:text-muted-foreground" />
                  </div>
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <button type="submit" disabled={submitting}
                    className="w-full bg-primary text-primary-foreground py-4 text-[11px] tracking-[0.2em] uppercase
                               hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? 'Confirmando...' : selectedService?.deposit_amount > 0 ? 'Siguiente →' : 'Confirmar Reserva'}
                  </button>
                </form>
                <button onClick={() => setStep(4)}
                  className="mt-6 flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider transition-colors mx-auto">
                  <ChevronLeft className="w-3 h-3" /> Volver
                </button>
              </div>
            )}

            {/* Paso 6: Pago de abono */}
            {step === 6 && selectedService?.deposit_amount > 0 && (
              <div className="max-w-md mx-auto">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em] text-center mb-2">
                  Pago de abono
                </p>
                <p className="text-primary text-xs text-center mb-8 tracking-wider">
                  {selectedService.name} · {selectedDate}
                  {selectedSlot && ` · ${formatTime(selectedSlot.start)}`}
                </p>

                <div className="flex items-center justify-between px-5 py-4 mb-4 bg-muted border-l-2 border-primary">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Abono requerido</p>
                    <p className="text-foreground text-xs mt-0.5">Transfiere antes de confirmar</p>
                  </div>
                  <span className="text-primary font-medium text-xl">
                    ${Math.round(selectedService.deposit_amount).toLocaleString('es-CL')}
                  </span>
                </div>

                <div className="border border-border mb-4">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Datos para transferencia</p>
                    <button type="button" onClick={copyAllBankData}
                      className="text-xs px-3 py-1.5 border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors">
                      {copiedAll ? '✓ Copiado' : 'Copiar datos'}
                    </button>
                  </div>
                  <pre className="text-sm px-4 py-4 text-foreground whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'inherit' }}>
{`Titular: Claudia Miranda Castro
RUT: 15.390.856-7
Banco: Banco Estado
Tipo: Cuenta Vista / Cuenta RUT
N° cuenta: 15390856
Email: studioclaumiranda@gmail.com`}
                  </pre>
                </div>

                <div className="mb-4">
                  <label className="block text-muted-foreground text-xs uppercase tracking-wider mb-2">
                    N° de comprobante / ID de transferencia <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={transferId}
                    onChange={e => setTransferId(e.target.value)}
                    placeholder="Ej: 123456789"
                    className="w-full bg-card border border-border text-foreground px-4 py-3 text-sm
                               focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  />
                </div>

                {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

                <button onClick={doConfirm} disabled={submitting || !transferId.trim()}
                  className="w-full bg-primary text-primary-foreground py-4 text-[11px] tracking-[0.2em] uppercase
                             hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Confirmando...' : 'Confirmar Reserva'}
                </button>

                <button onClick={() => setStep(5)}
                  className="mt-6 flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs uppercase tracking-wider transition-colors mx-auto">
                  <ChevronLeft className="w-3 h-3" /> Volver
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
