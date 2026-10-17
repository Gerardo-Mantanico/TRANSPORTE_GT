import type { ParametrosPagina } from '../pagina'
import type { Rol } from './rol'

export interface FiltroUsuarios extends ParametrosPagina {
  rol?: Rol
  idSucursal?: string
  activo?: boolean
  /** Busca en nombre y correo. */
  texto?: string
}

export interface FiltroSucursales extends ParametrosPagina {
  activa?: boolean
  /** Parte del nombre. */
  nombre?: string
}
