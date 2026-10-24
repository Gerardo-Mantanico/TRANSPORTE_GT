import type { ReactNode } from 'react'
import type { IconName } from '../../types'
import { Button } from './Button'
import { iconoDeAccion } from '../../utils/iconoDeAccion'
import { Icon } from './Icon'

interface ModalProps {
  eyebrow: string
  title: string
  body: ReactNode
  actionLabel?: string
  secondaryLabel?: string
  actionIcon?: IconName
  secondaryIcon?: IconName
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
  danger = false,
  dangerAction = false,
  onClose,
}: ModalProps) {
  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <section
        className={`modal flow-modal ${danger ? 'danger-modal' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
      >
        <header>
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
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
