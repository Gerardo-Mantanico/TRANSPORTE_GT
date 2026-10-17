import { Field } from './Field'

interface SelectFieldProps {
  label: string
  options: string[]
  required?: boolean
  defaultValue?: string
}

export function SelectField({ label, options, required = false, defaultValue }: SelectFieldProps) {
  return (
    <Field label={label} required={required}>
      <select defaultValue={defaultValue ?? ''}>
        {!defaultValue && (
          <option value="" disabled>
            Seleccione una opción
          </option>
        )}
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </Field>
  )
}
