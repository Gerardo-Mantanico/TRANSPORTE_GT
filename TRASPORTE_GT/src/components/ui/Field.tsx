import type { ChangeEventHandler, ReactNode } from 'react'

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
  children,
}: FieldProps) {
  return (
    <label className="field">
      <span className="field-label">
        <span>
          {label}
          {required && <b> *</b>}
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
