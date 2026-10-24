import type { ChangeEventHandler, ReactNode } from 'react'
import type { IconName } from '../../types'
import { iconoDeCampo } from '../../utils/iconoDeCampo'
import { Icon } from './Icon'

interface FieldProps {
  label: string
  type?: string
  placeholder?: string
  defaultValue?: string | number
  value?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  minLength?: number
  maxLength?: number
  step?: string
  action?: ReactNode
  /** Sobrescribe el icono que se deduce de la etiqueta. `null` lo oculta. */
  icona?: IconName | null
  children?: ReactNode
}

export function Field({
  label,
  type = 'text',
  placeholder,
  defaultValue,
  value,
  onChange,
  required = false,
  disabled,
  autoComplete,
  minLength,
  maxLength,
  step,
  action,
  icona,
  children,
}: FieldProps) {
  const icono = icona === null ? undefined : (icona ?? iconoDeCampo(label))

  return (
    <label className="field">
      <span className="field-label">
        <span className="field-name">
          {icono && <Icon name={icono} size={14} />}
          <span>
            {label}
            {required && <b> *</b>}
          </span>
        </span>
        {action}
      </span>
      {children ?? (
        <input
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          step={step}
        />
      )}
    </label>
  )
}
