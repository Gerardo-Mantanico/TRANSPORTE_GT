import type { ParametrosPagina } from '../pagina'
import type { EstadoOperativo } from './bus'

/** Filtros de `GET /buses` (paginación de Spring: page, size, sort). */
export interface FiltroBuses extends ParametrosPagina {
  /** Solo ADMIN_SISTEMA; ADMIN_SUCURSAL ve la suya. */
  idSucursal?: string
  estadoOperativo?: EstadoOperativo
  activo?: boolean
  /** Parte de la placa, marca o modelo. */
  texto?: string
}

/** Filtros de `GET /choferes`. */
export interface FiltroChoferes extends ParametrosPagina {
  idSucursal?: string
  activo?: boolean
  /** Parte del nombre, correo o licencia. */
  texto?: string
}
