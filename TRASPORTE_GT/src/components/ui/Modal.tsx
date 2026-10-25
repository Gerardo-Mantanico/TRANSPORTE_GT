import type { ReactNode } from 'react'
import type { IconName } from '../../types'
import { Button } from './Button'
import { iconoDeAccion, iconoDeEncabezado } from '../../utils/iconoDeAccion'
import { Icon } from './Icon'

interface ModalProps {
  eyebrow: string
  title: string
  body: ReactNode
  actionLabel?: string
  secondaryLabel?: string
  actionIcon?: IconName
  secondaryIcon?: IconName
  icona?: IconName
  danger?: boolean
  dangerAction?: boolean
  onClose: () => void
}

export function Modal({
  eyebrow,
  title,
  body,
  actionLabel = 'Guardar',
  secondaryLabel,
  actionIcon,
  secondaryIcon,
  icona,
  danger = false,
  dangerAction = false,
  onClose,
}: ModalProps) {
  const icono = icona ?? iconoDeEncabezado(title)

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section
        className={`modal flow-modal ${danger ? 'danger-modal' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
      >
        <header>
          <div className="modal-heading">
            {icono && (
              <span className="modal-icon">
                <Icon name={icono} size={20} />
              </span>
            )}
            <div>
              <span className="eyebrow">{eyebrow}</span>
              <h2>{title}</h2>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        <div className="modal-body">{body}</div>
        <footer>
          {secondaryLabel && (
            <Button variant="ghost" icon={secondaryIcon ?? 'close'} onClick={onClose}>
              {secondaryLabel}
            </Button>
          )}
          <Button
            variant={dangerAction ? 'danger' : 'primary'}
            icon={actionIcon ?? iconoDeAccion(actionLabel)}
            onClick={onClose}
          >
            {actionLabel}
          </Button>
        </footer>
      </section>
    </div>
  )
}
