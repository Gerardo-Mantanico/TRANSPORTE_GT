import { Field } from '../../components/ui/Field'
import type { Bus, Chofer } from '../../types/fleetTypes'
import { motivoBusNoElegible, motivoChoferNoElegible } from '../../utils/recursosViaje'

export function SelectorBus({
  buses,
  valor,
  onChange,
  pasajeros,
}: {
  buses: Bus[]
  valor: string
  onChange: (id: string) => void
  pasajeros?: number | null
}) {
  return (
    <Field label="Bus asignado" required>
      <select value={valor} onChange={(event) => onChange(event.target.value)} required>
        <option value="" disabled>
          Seleccione una opción
        </option>
        {buses.map((bus) => {
          const motivo = motivoBusNoElegible(bus, pasajeros)
          return (
            <option key={bus.id} value={bus.id} disabled={Boolean(motivo)}>
              {bus.placa} · {bus.capacidadPasajeros} pasajeros{motivo ? ` (${motivo})` : ''}
            </option>
          )
        })}
      </select>
    </Field>
  )
}

export function SelectorChofer({
  choferes,
  valor,
  onChange,
  fechaLlegada,
}: {
  choferes: Chofer[]
  valor: string
  onChange: (id: string) => void
  fechaLlegada: string
}) {
  return (
    <Field label="Chofer asignado" required>
      <select value={valor} onChange={(event) => onChange(event.target.value)} required>
        <option value="" disabled>
          Seleccione una opción
        </option>
        {choferes.map((chofer) => {
          const motivo = motivoChoferNoElegible(chofer, fechaLlegada)
          return (
            <option key={chofer.id} value={chofer.id} disabled={Boolean(motivo)}>
              {chofer.nombreCompleto} · Licencia {chofer.tipoLicencia}
              {motivo ? ` (${motivo})` : ''}
            </option>
          )
        })}
      </select>
    </Field>
  )
}
