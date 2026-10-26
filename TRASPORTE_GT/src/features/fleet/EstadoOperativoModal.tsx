import { useState } from 'react'
import { AvisoError } from '../../components/ui/Estado'
import { Field } from '../../components/ui/Field'
import { FormModal } from '../../components/ui/FormModal'
import { InfoNote } from '../../components/ui/Misc'
import { useCambiarEstadoOperativoBus } from '../../hooks/fleet'
import {
  ESTADOS_OPERATIVOS_ELEGIBLES,
  ETIQUETAS_ESTADO_OPERATIVO,
  type Bus,
  type EstadoOperativo,
} from '../../types/fleetTypes'

export function EstadoOperativoModal({
  bus,
  onClose,
  onGuardado,
}: {
  bus: Bus
  onClose: () => void
  onGuardado: (bus: Bus) => void
}) {
  const { ejecutar, cargando, error } = useCambiarEstadoOperativoBus()
  const [estado, setEstado] = useState<EstadoOperativo>(
    ESTADOS_OPERATIVOS_ELEGIBLES.includes(bus.estadoOperativo) ? bus.estadoOperativo : 'DISPONIBLE',
  )

  const guardar = async () => {
    const resultado = await ejecutar({ id: bus.id, estadoOperativo: estado, version: bus.version })
    if (resultado.ok) onGuardado(resultado.datos)
  }

  return (
    <FormModal
      eyebrow={`Bus ${bus.placa}`}
      title="Estado operativo"
      actionLabel="Guardar estado"
      enviando={cargando}
      onSubmit={guardar}
      onClose={onClose}
    >
      <div className="form-grid">
        <Field label="Estado actual" value={ETIQUETAS_ESTADO_OPERATIVO[bus.estadoOperativo]} disabled />
        <Field label="Nuevo estado" required>
          <select value={estado} onChange={(event) => setEstado(event.target.value as EstadoOperativo)}>
            {ESTADOS_OPERATIVOS_ELEGIBLES.map((opcion) => (
              <option key={opcion} value={opcion}>
                {ETIQUETAS_ESTADO_OPERATIVO[opcion]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <InfoNote>"En tránsito" solo cambia al registrar la salida o la llegada de un viaje.</InfoNote>
      <AvisoError error={error} />
    </FormModal>
  )
}
