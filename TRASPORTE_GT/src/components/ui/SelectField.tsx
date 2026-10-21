import { Field } from './Field'

export interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  label: string
  options: (string | SelectOption)[]
  required?: boolean
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
}

function normalize(option: string | SelectOption): SelectOption {
  return typeof option === 'string' ? { value: option, label: option } : option
}

export function SelectField({
  label,
  options,
  required = false,
  defaultValue,
  value,
  onChange,
  disabled = false,
}: SelectFieldProps) {
  const normalized = options.map(normalize)
  return (
    <Field label={label} required={required}>
      <select
        value={value ?? defaultValue ?? ''}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        disabled={disabled}
      >
        {value === undefined && !defaultValue && (
          <option value="" disabled>
            Seleccione una opción
          </option>
        )}
        {normalized.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
