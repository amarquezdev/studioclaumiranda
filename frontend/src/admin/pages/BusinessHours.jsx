import { useEffect, useState } from 'react'
import { adminGetHours, adminUpsertHours, getBlockedDates, adminCreateBlockedDate, adminDeleteBlockedDate } from '../../api/client'

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DEFAULT_ROW = { open_time: '09:00', close_time: '19:00', is_open: true }

const inputCls = "bg-dark border border-dark-border text-white text-sm px-3 py-2 rounded-sm focus:outline-none focus:border-gold w-full"
const labelCls = "block text-gray-400 text-xs uppercase tracking-wider mb-1"

export default function BusinessHours() {
  const [rows, setRows]     = useState(Array.from({ length: 7 }, (_, i) => ({ day_of_week: i, ...DEFAULT_ROW })))
  const [saving, setSaving] = useState({})
  const [saved, setSaved]   = useState({})

  // Blocked dates state
  const [blocks, setBlocks]         = useState([])
  const [blockForm, setBlockForm]   = useState({ date_from: '', date_to: '', reason: '' })
  const [blockSaving, setBlockSaving] = useState(false)
  const [blockError, setBlockError] = useState('')

  useEffect(() => {
    adminGetHours().then(r => {
      const map = {}
      r.data.forEach(h => { map[h.day_of_week] = h })
      setRows(Array.from({ length: 7 }, (_, i) => map[i] ?? { day_of_week: i, ...DEFAULT_ROW }))
    }).catch(() => {})
    loadBlocks()
  }, [])

  const loadBlocks = () =>
    getBlockedDates().then(r => setBlocks(r.data)).catch(() => {})

  const update = (day, field, value) =>
    setRows(prev => prev.map(r => r.day_of_week === day ? { ...r, [field]: value } : r))

  const save = async (row) => {
    setSaving(s => ({ ...s, [row.day_of_week]: true }))
    setSaved(s => ({ ...s, [row.day_of_week]: false }))
    try {
      await adminUpsertHours(row.day_of_week, {
        open_time: row.open_time,
        close_time: row.close_time,
        is_open: row.is_open,
      })
      setSaved(s => ({ ...s, [row.day_of_week]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [row.day_of_week]: false })), 2000)
    } catch (e) {
      alert(e.response?.data?.detail || 'Error al guardar')
    } finally {
      setSaving(s => ({ ...s, [row.day_of_week]: false }))
    }
  }

  const handleAddBlock = async (e) => {
    e.preventDefault()
    setBlockError('')
    if (!blockForm.date_from || !blockForm.date_to) {
      setBlockError('Debes ingresar fecha de inicio y fin.')
      return
    }
    if (blockForm.date_to < blockForm.date_from) {
      setBlockError('La fecha de fin debe ser igual o posterior a la de inicio.')
      return
    }
    setBlockSaving(true)
    try {
      await adminCreateBlockedDate({
        date_from: blockForm.date_from,
        date_to:   blockForm.date_to,
        reason:    blockForm.reason || null,
      })
      setBlockForm({ date_from: '', date_to: '', reason: '' })
      loadBlocks()
    } catch (e) {
      setBlockError(e.response?.data?.detail || 'Error al guardar el bloqueo')
    } finally { setBlockSaving(false) }
  }

  const handleDeleteBlock = async (id) => {
    await adminDeleteBlockedDate(id).catch(() => {})
    loadBlocks()
  }

  const fmtDate = (iso) => {
    if (!iso) return ''
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
  }

  return (
    <div className="p-8 space-y-10">
      {/* ── Horarios semanales ────────────────────────────────────── */}
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Horarios de atención</h1>
          <p className="text-gray-500 text-sm mt-1">Configura los días y horas de apertura del negocio</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-sm overflow-hidden max-w-2xl">
          {rows.map(row => (
            <div key={row.day_of_week}
              className="flex items-center gap-4 px-5 py-4 border-b border-dark-border/50 last:border-0">
              <div className="w-24">
                <p className={`text-sm font-medium ${row.is_open ? 'text-white' : 'text-gray-600'}`}>
                  {DAY_NAMES[row.day_of_week]}
                </p>
              </div>

              <button
                onClick={() => update(row.day_of_week, 'is_open', !row.is_open)}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
                  row.is_open ? 'bg-gold' : 'bg-dark-border'
                }`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  row.is_open ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>

              <div className={`flex items-center gap-2 flex-1 transition-opacity ${row.is_open ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                <input type="time" value={row.open_time || '09:00'}
                  onChange={e => update(row.day_of_week, 'open_time', e.target.value)}
                  className="bg-dark border border-dark-border text-white text-sm px-2 py-1.5 rounded-sm focus:outline-none focus:border-gold w-28" />
                <span className="text-gray-600 text-sm">—</span>
                <input type="time" value={row.close_time || '19:00'}
                  onChange={e => update(row.day_of_week, 'close_time', e.target.value)}
                  className="bg-dark border border-dark-border text-white text-sm px-2 py-1.5 rounded-sm focus:outline-none focus:border-gold w-28" />
              </div>

              <button onClick={() => save(row)} disabled={saving[row.day_of_week]}
                className={`text-xs px-3 py-1.5 rounded-sm border transition-colors flex-shrink-0 ${
                  saved[row.day_of_week]
                    ? 'border-green-700 text-green-400 bg-green-900/20'
                    : 'border-dark-border text-gray-400 hover:border-gold hover:text-gold'
                }`}>
                {saving[row.day_of_week] ? '...' : saved[row.day_of_week] ? '✓ Guardado' : 'Guardar'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fechas bloqueadas ─────────────────────────────────────── */}
      <div className="max-w-2xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Fechas bloqueadas</h2>
          <p className="text-gray-500 text-sm mt-1">Bloquea rangos de días — aparecerán en rojo en el calendario y no se podrán reservar.</p>
        </div>

        {/* Formulario nuevo bloqueo */}
        <form onSubmit={handleAddBlock} className="bg-dark-card border border-dark-border rounded-sm p-5 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls}>Desde</label>
              <input type="date" value={blockForm.date_from}
                onChange={e => setBlockForm(f => ({ ...f, date_from: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Hasta</label>
              <input type="date" value={blockForm.date_to}
                min={blockForm.date_from}
                onChange={e => setBlockForm(f => ({ ...f, date_to: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Razón (opcional)</label>
              <input type="text" value={blockForm.reason} placeholder="Ej: Vacaciones"
                onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))}
                className={inputCls} />
            </div>
          </div>
          {blockError && <p className="text-red-400 text-xs mb-3">{blockError}</p>}
          <button type="submit" disabled={blockSaving}
            className="btn-gold disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            {blockSaving ? 'Guardando...' : '+ Bloquear fechas'}
          </button>
        </form>

        {/* Lista de bloqueos activos */}
        {blocks.length === 0 ? (
          <p className="text-gray-600 text-sm">No hay fechas bloqueadas actualmente.</p>
        ) : (
          <div className="bg-dark-card border border-dark-border rounded-sm overflow-hidden">
            {blocks.map(b => (
              <div key={b.id}
                className="flex items-center justify-between px-5 py-3 border-b border-dark-border/50 last:border-0">
                <div>
                  <span className="text-sm text-white">
                    {fmtDate(b.date_from)}
                    {b.date_from !== b.date_to && ` → ${fmtDate(b.date_to)}`}
                  </span>
                  {b.reason && (
                    <span className="ml-3 text-xs text-gray-500">— {b.reason}</span>
                  )}
                </div>
                <button onClick={() => handleDeleteBlock(b.id)}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors ml-4 flex-shrink-0">
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
