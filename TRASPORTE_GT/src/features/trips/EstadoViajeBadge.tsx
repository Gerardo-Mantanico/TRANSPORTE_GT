import { Badge } from '../../components/ui/Badge'
import type { BadgeTone } from '../../types'
import { ETIQUETAS_ESTADO_VIAJE, type EstadoViaje } from '../../types/tripTypes'

const TONOS: Record<EstadoViaje, BadgeTone> = {
  PENDIENTE_ASIGNACION: 'warning',
  PROGRAMADO: 'info',
  EN_TRANSITO: 'neutral',
  FINALIZADO: 'success',
}

export function EstadoViajeBadge({ estado }: { estado: EstadoViaje }) {
  return <Badge tone={TONOS[estado]}>{ETIQUETAS_ESTADO_VIAJE[estado]}</Badge>
}
