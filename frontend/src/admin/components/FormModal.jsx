export default function FormModal({ title, fields, data, onChange, onSubmit, onClose, loading, error }) {
  const inputCls = "w-full bg-input border border-border px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors text-foreground"
  const labelCls = "block text-xs uppercase tracking-wider mb-1.5 text-muted-foreground"

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-card border border-border rounded-sm w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-light text-lg text-foreground">{title}</h3>
          <button onClick={onClose} className="transition-colors text-lg leading-none text-muted-foreground hover:text-primary">×</button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-xs px-3 py-2 rounded-sm">
              {error}
            </div>
          )}

          {fields.map(field => (
            <div key={field.name}>
              <label className={labelCls}>
                {field.label}{field.required && <span className="text-primary ml-1">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={data[field.name] ?? ''}
                  onChange={e => onChange(field.name, e.target.value)}
                  required={field.required}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder={field.placeholder}
                />
              ) : field.type === 'select' ? (
                <select
                  name={field.name}
                  value={data[field.name] ?? ''}
                  onChange={e => onChange(field.name, e.target.value)}
                  required={field.required}
                  className={inputCls}>
                  {field.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!data[field.name]}
                    onChange={e => onChange(field.name, e.target.checked)}
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm text-foreground/80">{field.checkLabel}</span>
                </label>
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={data[field.name] ?? ''}
                  onChange={e => onChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                  required={field.required}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  className={inputCls}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-sm transition-colors hover:border-primary text-muted-foreground">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="btn-gold disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
