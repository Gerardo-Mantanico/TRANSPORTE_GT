import type { EstadoAlquiler } from './alquiler'

/** Filtros de `GET /alquileres/mios`. Pagina con `pagina`/`tamano` (máx. 100). */
export interface FiltroMisAlquileres {
  pagina?: number
  tamano?: number
}

/**
 * Filtros de `GET /alquileres` (SUC y CAJ: su sucursal; SIS: todas). `desde` y `hasta` son días `YYYY-MM-DD` de
 * Guatemala, incluidos.
 */
export interface FiltroAlquileres extends FiltroMisAlquileres {
  estado?: EstadoAlquiler
  desde?: string
  hasta?: string
  /** true: confirmados que aún no tienen bus asignado. */
  sinAsignar?: boolean
}
