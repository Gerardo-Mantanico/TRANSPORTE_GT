import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Icon } from './Icon'
import { ToastContext, type ToastApi, type ToastVariant } from './useToast'

interface ToastItem {
  id: number
  variant: ToastVariant
  message: string
}

const ICONS: Record<ToastVariant, 'alert' | 'check' | 'clock'> = {
  error: 'alert',
  success: 'check',
  info: 'clock',
}

const TITLES: Record<ToastVariant, string> = {
  error: 'Transacción no realizada',
  success: 'Transacción exitosa',
  info: 'Aviso',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const seq = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = ++seq.current
      setToasts((prev) => [...prev.slice(-3), { id, variant, message }])
      window.setTimeout(() => dismiss(id), variant === 'error' ? 8000 : 4500)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      error: (message) => push('error', message),
      success: (message) => push('success', message),
      info: (message) => push('info', message),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-viewport" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.variant}`}>
            <span className="toast-icon">
              <Icon name={ICONS[toast.variant]} size={18} />
            </span>
            <div className="toast-body">
              <strong>{TITLES[toast.variant]}</strong>
              <p>{toast.message}</p>
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismiss(toast.id)}
              aria-label="Cerrar alerta"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
