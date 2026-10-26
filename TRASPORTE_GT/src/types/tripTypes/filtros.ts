import type { EstadoViaje, TipoViaje } from './viaje'

/**
 * Filtros de `GET /viajes`, resueltos en la base de datos y combinados con AND. Pagina con `pagina`/`tamano`
 * (máx. 100), como Boletos; siempre ordenado por hora de salida.
 */
export interface FiltroListadoViajes {
  tipoViaje?: TipoViaje
  estado?: EstadoViaje
  idRuta?: string
  /** Solo ADMIN_SISTEMA; SUC y CAJ ven su sucursal y CHO sus viajes. */
  idSucursal?: string
  /** ISO con zona: salida desde. */
  desde?: string
  /** ISO con zona: salida hasta. */
  hasta?: string
  /** true: alquileres pendientes de bus y chofer. */
  sinAsignar?: boolean
  pagina?: number
  tamano?: number
}

/** Filtros de `GET /rutas`. */
export interface FiltroRutas {
  idSucursalOrigen?: string
  idSucursalDestino?: string
}
