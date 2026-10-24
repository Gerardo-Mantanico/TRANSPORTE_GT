import type { FormEvent, ReactNode } from 'react'
import type { IconName } from '../../types'
import { Button } from './Button'
import { iconoDeAccion } from '../../utils/iconoDeAccion'
import { Icon } from './Icon'

interface FormModalProps {
  eyebrow: string
  title: string
  children: ReactNode
  actionLabel: string
  onSubmit: () => void
  onClose: () => void
  enviando?: boolean
  danger?: boolean
  actionIcon?: IconName
  footer?: ReactNode
}

/** Modal con formulario real: el botón principal envía el formulario. */
export function FormModal({
  eyebrow,
  title,
  children,
  actionLabel,
  onSubmit,
  onClose,
  enviando = false,
  danger = false,
  actionIcon,
  footer,
}: FormModalProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!enviando) onSubmit()
  }

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <form
        className={`modal ${danger ? 'flow-modal danger-modal' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        onSubmit={handleSubmit}
      >
        <header>
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        <footer>
          {footer ?? (
            <>
              <Button variant="ghost" icon="close" onClick={onClose} disabled={enviando}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant={danger ? 'danger' : 'primary'}
                icon={enviando ? 'sync' : (actionIcon ?? iconoDeAccion(actionLabel))}
                className={enviando ? 'is-busy' : ''}
                disabled={enviando}
              >
                {enviando ? 'Procesando...' : actionLabel}
              </Button>
            </>
          )}
        </footer>
      </form>
    </div>
  )
}
