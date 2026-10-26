import type { IconName } from '../../types'
import { Field } from './Field'

interface SelectFieldProps {
  label: string
  options: string[]
  required?: boolean
  defaultValue?: string
  icona?: IconName | null
}

export function SelectField({ label, options, required = false, defaultValue, icona }: SelectFieldProps) {
  return (
    <Field label={label} required={required} icona={icona}>
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
