import type { IconName } from '../../types'
import { Icon } from './Icon'

interface AccionFilaProps {
  icono: IconName
  /** Texto visible al pasar el mouse y leído por lectores de pantalla. */
  titulo: string
  onClick: () => void
  disabled?: boolean
  variante?: 'ghost' | 'danger'
}

/** Botón cuadrado de solo icono para la columna de acciones de una tabla. */
export function AccionFila({ icono, titulo, onClick, disabled, variante = 'ghost' }: AccionFilaProps) {
  return (
    <button
      type="button"
      className={`button ${variante} accion-fila`}
      onClick={onClick}
      disabled={disabled}
      title={titulo}
      aria-label={titulo}
    >
      <Icon name={icono} size={16} />
    </button>
  )
}
