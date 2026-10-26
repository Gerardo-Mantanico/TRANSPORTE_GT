import type { EstadoCompra } from './compra'

/** Filtros de `GET /boletos/viajes` (lista sin paginar). */
export interface FiltroViajes {
  idOrigen?: string
  idRuta?: string
  /** Parte del nombre del destino. */
  destino?: string
  /** Día de salida `YYYY-MM-DD` (hora de Guatemala). */
  fecha?: string
}

/** Filtros de `GET /boletos/compras/mias`. Pagina con `pagina`/`tamano` (máx. 100). */
export interface FiltroMisCompras {
  estado?: EstadoCompra
  pagina?: number
  tamano?: number
}

/** Filtros de `GET /boletos/compras` (compras de la sucursal del usuario). */
export interface FiltroComprasSucursal extends FiltroMisCompras {
  idViaje?: string
}
