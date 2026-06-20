import { createPortal } from 'react-dom'
import { X, AlertTriangle, Trash2, Info } from 'lucide-react'
import { Spinner } from './Spinner'
import { useMinPending } from '@/hooks/useMinPending'

type Variant = 'danger' | 'warning' | 'default'

interface ConfirmModalProps {
  title: string
  description?: string
  confirmLabel?: string
  variant?: Variant
  isPending?: boolean
  onConfirm: () => void
  onClose: () => void
}

const config: Record<Variant, { icon: React.ReactNode; confirmClass: string; iconBg: string }> = {
  danger: {
    icon: <Trash2 size={20} className="text-red-500" />,
    confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
    iconBg: 'bg-red-50',
  },
  warning: {
    icon: <AlertTriangle size={20} className="text-amber-500" />,
    confirmClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    iconBg: 'bg-amber-50',
  },
  default: {
    icon: <Info size={20} className="text-brand-500" />,
    confirmClass: 'gradient-brand text-white hover:opacity-90',
    iconBg: 'bg-brand-50',
  },
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'default',
  isPending = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const { icon, confirmClass, iconBg } = config[variant]
  const pending = useMinPending(isPending)

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors text-neutral-400">
            <X size={16} />
          </button>
        </div>

        <h3 className="text-base font-semibold text-neutral-900 mb-1.5">{title}</h3>
        {description && <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={pending}
            className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 transition-opacity ${confirmClass}`}
          >
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Please wait…
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
