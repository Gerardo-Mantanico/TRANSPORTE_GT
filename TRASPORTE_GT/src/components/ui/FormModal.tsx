import type { FormEvent, ReactNode } from 'react'
import type { IconName } from '../../types'
import { Button } from './Button'
import { iconoDeAccion, iconoDeEncabezado } from '../../utils/iconoDeAccion'
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
  icona?: IconName
  footer?: ReactNode
  fullScreen?: boolean
  subtitle?: string
  steps?: { label: string; description: string }[]
  activeStep?: number
  hideFooter?: boolean
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
  icona,
  footer,
  fullScreen = false,
  subtitle,
  steps,
  activeStep = 1,
  hideFooter = false,
}: FormModalProps) {
  const icono = icona ?? iconoDeEncabezado(title)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!enviando) onSubmit()
  }

  return (
    <div className="modal-layer">
      <button className="modal-scrim" onClick={onClose} aria-label="Cerrar" />
      <form
        className={`modal ${danger ? 'flow-modal danger-modal' : ''} ${fullScreen ? 'modal-full-screen' : ''}`.trim()}
        role="dialog"
        aria-modal="true"
        onSubmit={handleSubmit}
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
              {subtitle && <p className="modal-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">
            <Icon name="close" />
          </button>
        </header>
        {steps && steps.length > 0 && (
          <nav className="modal-stepper" aria-label="Progreso de la solicitud">
            {steps.map((step, index) => {
              const numero = index + 1
              return (
                <div className={`modal-step ${numero === activeStep ? 'active' : ''} ${numero < activeStep ? 'complete' : ''}`} key={step.label}>
                  <span>{numero < activeStep ? '✓' : numero}</span>
                  <div>
                    <strong>{step.label}</strong>
                    <small>{step.description}</small>
                  </div>
                </div>
              )
            })}
          </nav>
        )}
        <div className="modal-body">{children}</div>
        {!hideFooter && (
          <footer>
            {footer ?? (
              <Button
                type="submit"
                variant={danger ? 'danger' : 'primary'}
                icon={enviando ? 'sync' : (actionIcon ?? iconoDeAccion(actionLabel))}
                className={enviando ? 'is-busy' : ''}
                disabled={enviando}
              >
                {enviando ? 'Procesando...' : actionLabel}
              </Button>
            )}
          </footer>
        )}
      </form>
    </div>
  )
}
