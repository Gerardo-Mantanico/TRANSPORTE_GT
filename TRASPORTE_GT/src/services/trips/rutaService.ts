import { clienteViajes, limpiarParametros, solicitar } from '../../api/clienteHttp'
import type { FiltroRutas, Ruta, RutaRequest } from '../../types/tripTypes'

/** GET /rutas?idSucursalOrigen&idSucursalDestino → 200 (cualquier usuario autenticado) */
export function listarRutas(filtro: FiltroRutas = {}, signal?: AbortSignal) {
  return solicitar<Ruta[]>({ method: 'GET', url: '/rutas', params: limpiarParametros(filtro), signal }, clienteViajes)
}

/** GET /rutas/{id} → 200 | 404 */
export function obtenerRuta(id: string, signal?: AbortSignal) {
  return solicitar<Ruta>({ method: 'GET', url: `/rutas/${id}`, signal }, clienteViajes)
}

/** POST /rutas → 201 | 403 si no es la sucursal de origen | 409 RUTA_DUPLICADA / SUCURSAL_NO_ENCONTRADA */
export function crearRuta(datos: RutaRequest, signal?: AbortSignal) {
  return solicitar<Ruta>({ method: 'POST', url: '/rutas', data: datos, signal }, clienteViajes)
}

/** PUT /rutas/{id} → 200 | 409 RUTA_INVALIDA (cambiar el origen) / RUTA_DUPLICADA */
export function actualizarRuta(id: string, datos: RutaRequest, signal?: AbortSignal) {
  return solicitar<Ruta>({ method: 'PUT', url: `/rutas/${id}`, data: datos, signal }, clienteViajes)
}

/** DELETE /rutas/{id} → 204 | 409 RUTA_CON_VIAJES */
export function eliminarRuta(id: string, signal?: AbortSignal) {
  return solicitar<void>({ method: 'DELETE', url: `/rutas/${id}`, signal }, clienteViajes)
}
