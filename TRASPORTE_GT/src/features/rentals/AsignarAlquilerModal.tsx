import { AvisoError, Cargando } from '../../components/ui/Estado'
import { FormModal } from '../../components/ui/FormModal'
import { useViaje } from '../../hooks/trips'
import type { Viaje } from '../../types/tripTypes'
import type { Alquiler } from '../../types/rentalTypes'
import { AsignacionModal } from '../trips/ViajeFormModal'

/**
 * La asignación vive en Viajes (`PATCH /viajes/{id}/asignacion`): se carga el viaje del alquiler y se reutiliza
 * su modal. Alquileres refleja el bus y el chofer al consumir ViajeActualizado.
 */
export function AsignarAlquilerModal({
  alquiler,
  onClose,
  onAsignado,
}: {
  alquiler: Alquiler
  onClose: () => void
  onAsignado: (viaje: Viaje) => void
}) {
  const viaje = useViaje(alquiler.idViaje)

  if (viaje.datos) return <AsignacionModal viaje={viaje.datos} onClose={onClose} onGuardado={onAsignado} />

  return (
    <FormModal eyebrow="Alquiler privado" title="Asignar bus y chofer" actionLabel="Asignar" enviando onSubmit={() => {}} onClose={onClose}>
      {!alquiler.idViaje ? (
        <p className="modal-paragraph">
          Viajes todavía no creó el viaje de este alquiler (se crea al confirmarse el pago). Intente de nuevo en unos segundos.
        </p>
      ) : viaje.error ? (
        <AvisoError error={viaje.error} onReintentar={viaje.recargar} />
      ) : (
        <Cargando texto="Cargando el viaje del alquiler..." />
      )}
    </FormModal>
  )
}
