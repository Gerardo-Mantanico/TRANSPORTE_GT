import { Badge } from '../../components/ui/Badge'
import { hoyIso } from '../../utils/format'

/** Días que alertan del vencimiento (Notificaciones avisa a 15 y 3 días). */
const DIAS_AVISO = 15

function diasHasta(fecha: string): number {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  const [anioHoy, mesHoy, diaHoy] = hoyIso().split('-').map(Number)
  return Math.round((Date.UTC(anio, mes - 1, dia) - Date.UTC(anioHoy, mesHoy - 1, diaHoy)) / 86_400_000)
}

export function EstadoLicencia({ fechaVencimiento }: { fechaVencimiento: string }) {
  const dias = diasHasta(fechaVencimiento)
  if (dias < 0) return <Badge tone="danger">Vencida</Badge>
  if (dias === 0) return <Badge tone="danger">Vence hoy</Badge>
  if (dias <= DIAS_AVISO) return <Badge tone="warning">Vence en {dias} día{dias === 1 ? '' : 's'}</Badge>
  return <Badge tone="success">Vigente</Badge>
}
