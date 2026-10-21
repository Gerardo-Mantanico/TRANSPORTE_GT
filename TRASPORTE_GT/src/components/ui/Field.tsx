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
  min?: number | string
  max?: number | string
  step?: number | string
  inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
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
  disabled = false,
  min,
  max,
  step,
  inputMode,
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
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          inputMode={inputMode}
        />
      )}
    </label>
  )
}
