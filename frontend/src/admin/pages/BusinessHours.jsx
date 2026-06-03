import { useEffect, useState } from 'react'
import { adminGetHours, adminUpsertHours } from '../../api/client'

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const DEFAULT_ROW = { open_time: '09:00', close_time: '19:00', is_open: true }

export default function BusinessHours() {
  const [rows, setRows]     = useState(Array.from({ length: 7 }, (_, i) => ({ day_of_week: i, ...DEFAULT_ROW })))
  const [saving, setSaving] = useState({})
  const [saved, setSaved]   = useState({})

  useEffect(() => {
    adminGetHours().then(r => {
      const map = {}
      r.data.forEach(h => { map[h.day_of_week] = h })
      setRows(Array.from({ length: 7 }, (_, i) => map[i] ?? { day_of_week: i, ...DEFAULT_ROW }))
    }).catch(() => {})
  }, [])

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Horarios de atención</h1>
        <p className="text-gray-500 text-sm mt-1">Configura los días y horas de apertura del negocio</p>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-sm overflow-hidden max-w-2xl">
        {rows.map(row => (
          <div key={row.day_of_week}
            className="flex items-center gap-4 px-5 py-4 border-b border-dark-border/50 last:border-0">
            {/* Day name */}
            <div className="w-24">
              <p className={`text-sm font-medium ${row.is_open ? 'text-white' : 'text-gray-600'}`}>
                {DAY_NAMES[row.day_of_week]}
              </p>
            </div>

            {/* Toggle */}
            <button
              onClick={() => update(row.day_of_week, 'is_open', !row.is_open)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
                row.is_open ? 'bg-gold' : 'bg-dark-border'
              }`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                row.is_open ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>

            {/* Time inputs */}
            <div className={`flex items-center gap-2 flex-1 transition-opacity ${row.is_open ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <input
                type="time"
                value={row.open_time || '09:00'}
                onChange={e => update(row.day_of_week, 'open_time', e.target.value)}
                className="bg-dark border border-dark-border text-white text-sm px-2 py-1.5 rounded-sm focus:outline-none focus:border-gold w-28"
              />
              <span className="text-gray-600 text-sm">—</span>
              <input
                type="time"
                value={row.close_time || '19:00'}
                onChange={e => update(row.day_of_week, 'close_time', e.target.value)}
                className="bg-dark border border-dark-border text-white text-sm px-2 py-1.5 rounded-sm focus:outline-none focus:border-gold w-28"
              />
            </div>

            {/* Save button */}
            <button
              onClick={() => save(row)}
              disabled={saving[row.day_of_week]}
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
  )
}
