import { createContext, useContext } from 'react'

export type ToastVariant = 'error' | 'success' | 'info'

export interface ToastApi {
  error: (message: string) => void
  success: (message: string) => void
  info: (message: string) => void
}

export const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>')
  }
  return context
}
