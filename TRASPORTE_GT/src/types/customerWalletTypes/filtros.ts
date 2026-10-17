import type { TipoMovimiento } from './cartera'

/** Filtros de `GET /cartera/yo/movimientos`. Este endpoint pagina con `pagina`/`tamano` (máx. 100). */
export interface FiltroMovimientos {
  tipo?: TipoMovimiento
  /** `YYYY-MM-DD` */
  desde?: string
  /** `YYYY-MM-DD` */
  hasta?: string
  pagina?: number
  tamano?: number
}
