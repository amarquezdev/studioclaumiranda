export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-dark-card border border-dark-border rounded-sm p-6 w-full max-w-sm shadow-xl">
        <h3 className="font-light text-lg mb-2" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#F2EFE9' }}>
          Confirmar acción
        </h3>
        <p className="text-sm mb-6" style={{ color: '#A09890' }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm border border-dark-border rounded-sm transition-colors hover:border-gold"
            style={{ color: '#A09890' }}>
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-sm transition-colors">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
