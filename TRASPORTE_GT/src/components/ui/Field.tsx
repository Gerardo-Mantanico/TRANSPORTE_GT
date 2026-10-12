import type { ChangeEventHandler, ReactNode } from 'react'

interface FieldProps {
  label: string
  type?: string
  placeholder?: string
  defaultValue?: string | number
  value?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  required?: boolean
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
        />
      )}
    </label>
  )
}
