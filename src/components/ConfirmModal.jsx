import { createPortal } from 'react-dom'
import Spinner from './Spinner.jsx'

export default function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = 'تأكيد',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 p-4"
      onClick={onCancel}
    >
      <div
        className="rise-in bg-paper w-full sm:max-w-sm rounded-2xl p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display font-bold text-lg mb-1.5">{title}</h2>
        {body && <p className="text-sm text-inkfaint mb-5">{body}</p>}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-tag font-medium text-sm bg-stone text-ink hover:bg-stone/70 transition"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-tag font-medium text-sm text-white transition disabled:opacity-60 ${
              danger ? 'bg-brick hover:bg-brick/90' : 'bg-awning hover:bg-awningdark'
            }`}
          >
            {loading ? <Spinner /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
