import { Badge } from '../../components/ui/Badge'
import type { BadgeTone } from '../../types'
import { ETIQUETAS_ESTADO_COMPRA, type Compra, type EstadoCompra } from '../../types/ticketTypes'
import type { ViajeResumen } from '../../types/tripTypes'
import { etiquetaAsiento } from '../../utils/asientos'
import { formatFechaHora } from '../../utils/format'

const TONOS: Record<EstadoCompra, BadgeTone> = {
  RESERVADA: 'warning',
  CONFIRMADA: 'success',
  ANULADA: 'neutral',
}

/**
 * Ruta y salida del viaje de una compra, con el resumen de TripService. TripService borra los viajes eliminados,
 * así que si no viene y la compra está anulada se muestra como viaje eliminado.
 */
export function CeldaViaje({ compra, viaje, cargando }: { compra: Compra; viaje: ViajeResumen | undefined; cargando: boolean }) {
  if (viaje) {
    return (
      <>
        <strong>
          {viaje.nombreOrigen} → {viaje.nombreDestino}
        </strong>
        <small className="cell-note">
          {formatFechaHora(viaje.fechaHoraSalida)}
          {viaje.placaBus ? ` · ${viaje.placaBus}` : ''}
        </small>
      </>
    )
  }
  if (cargando) return <small className="cell-note">Cargando viaje...</small>
  return (
    <>
      <strong>{compra.estado === 'ANULADA' ? 'Viaje eliminado' : 'Viaje no disponible'}</strong>
      <small className="cell-note">Pagado el {compra.fechaPago}</small>
    </>
  )
}

export function CeldaAsientos({ compra }: { compra: Compra }) {
  return (
    <span className="chip" title={compra.asientos.map((boleto) => boleto.codigo).join(', ')}>
      {compra.asientos.map((boleto) => etiquetaAsiento(boleto.numeroAsiento)).join(', ')}
    </span>
  )
}

export function EstadoCompraBadge({ compra }: { compra: Compra }) {
  return (
    <div className="cell-stack">
      <Badge tone={TONOS[compra.estado]}>{ETIQUETAS_ESTADO_COMPRA[compra.estado]}</Badge>
      {compra.estado === 'ANULADA' && compra.motivoAnulacion && (
        <small className="cell-note">{compra.motivoAnulacion}</small>
      )}
    </div>
  )
}
