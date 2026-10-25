import { clienteReportes, limpiarParametros, solicitar } from '../../api/clienteHttp'
import type { OpcionCatalogo } from '../../types/reportTypes'

/** GET /reportes/catalogos/sucursales → 200. Solo SIS. */
export function listarSucursalesReportes(signal?: AbortSignal) {
  return solicitar<OpcionCatalogo[]>({ method: 'GET', url: '/reportes/catalogos/sucursales', signal }, clienteReportes)
}

/** GET /reportes/catalogos/rutas?idSucursal → 200. SUC recibe siempre las de su sucursal. */
export function listarRutasReportes(idSucursal?: string, signal?: AbortSignal) {
  return solicitar<OpcionCatalogo[]>(
    { method: 'GET', url: '/reportes/catalogos/rutas', params: limpiarParametros({ idSucursal }), signal },
    clienteReportes,
  )
}

/** GET /reportes/catalogos/buses?idSucursal → 200. SUC recibe siempre los de su sucursal. */
export function listarBusesReportes(idSucursal?: string, signal?: AbortSignal) {
  return solicitar<OpcionCatalogo[]>(
    { method: 'GET', url: '/reportes/catalogos/buses', params: limpiarParametros({ idSucursal }), signal },
    clienteReportes,
  )
}
