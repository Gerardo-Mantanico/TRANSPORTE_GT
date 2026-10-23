import { Badge } from '../../components/ui/Badge'
import type { BadgeTone } from '../../types'
import { ETIQUETAS_ESTADO_ALQUILER, type EstadoAlquiler } from '../../types/rentalTypes'

const TONOS: Record<EstadoAlquiler, BadgeTone> = {
  SOLICITADO: 'warning',
  COTIZADO: 'info',
  CONFIRMADO: 'success',
  FINALIZADO: 'neutral',
  CANCELADO: 'danger',
}

export function EstadoAlquilerBadge({ estado }: { estado: EstadoAlquiler }) {
  return <Badge tone={TONOS[estado]}>{ETIQUETAS_ESTADO_ALQUILER[estado]}</Badge>
}
