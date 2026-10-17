import type { ReactNode } from 'react'
import type { ApiError } from '../../api/ApiError'
import { Button } from './Button'
import { Icon } from './Icon'

export function Cargando({ texto = 'Cargando...', pantalla = false }: { texto?: string; pantalla?: boolean }) {
  return (
    <div className={`loading-state ${pantalla ? 'full' : ''}`.trim()} role="status" aria-live="polite">
      <span className="spinner" />
      <small>{texto}</small>
    </div>
  )
}

interface AvisoErrorProps {
  error: ApiError | null
  onReintentar?: () => void
  children?: ReactNode
}

/** Muestra el mensaje de `RespuestaError` del backend. */
export function AvisoError({ error, onReintentar, children }: AvisoErrorProps) {
  if (!error) return null
  return (
    <div className="form-error" role="alert">
      <Icon name="close" size={15} />
      <div>
        <strong>{error.message}</strong>
        {children ?? (error.status === 409 && <small>Recargue los datos e intente de nuevo.</small>)}
      </div>
      {onReintentar && (
        <Button variant="ghost" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
