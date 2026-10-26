import { clienteFlota, limpiarParametros, solicitar } from '../../api/clienteHttp'
import { normalizarPagina, type PaginaCruda } from '../../api/paginacion'
import type { Pagina } from '../../types/pagina'
import type {
  ActualizarChoferRequest,
  Chofer,
  CrearChoferRequest,
  FiltroChoferes,
} from '../../types/fleetTypes'

/** GET /choferes?idSucursal&activo&texto&page&size&sort → 200 paginado */
export async function listarChoferes(filtro: FiltroChoferes = {}, signal?: AbortSignal): Promise<Pagina<Chofer>> {
  const cruda = await solicitar<PaginaCruda<Chofer>>(
    { method: 'GET', url: '/choferes', params: limpiarParametros(filtro), signal },
    clienteFlota,
  )
  return normalizarPagina(cruda)
}

/** GET /choferes/{id} → 200 | 404 */
export function obtenerChofer(id: string, signal?: AbortSignal) {
  return solicitar<Chofer>({ method: 'GET', url: `/choferes/${id}`, signal }, clienteFlota)
}

/** POST /choferes → 201 | 409 LICENCIA_DUPLICADA / USUARIO_YA_ENLAZADO. Solo ADMIN_SUCURSAL. */
export function crearChofer(datos: CrearChoferRequest, signal?: AbortSignal) {
  return solicitar<Chofer>({ method: 'POST', url: '/choferes', data: datos, signal }, clienteFlota)
}

/** PUT /choferes/{id} → 200 | 409 licencia duplicada, usuario enlazado o `version` desactualizada */
export function actualizarChofer(id: string, datos: ActualizarChoferRequest, signal?: AbortSignal) {
  return solicitar<Chofer>(
    { method: 'PUT', url: `/choferes/${id}`, data: { ...datos, version: datos.version ?? null }, signal },
    clienteFlota,
  )
}

/** PATCH /choferes/{id}/activo → 200 | 409 versión desactualizada. Los choferes no se eliminan. */
export function cambiarActivoChofer(id: string, activo: boolean, version: number | null, signal?: AbortSignal) {
  return solicitar<Chofer>(
    { method: 'PATCH', url: `/choferes/${id}/activo`, data: { activo, version }, signal },
    clienteFlota,
  )
}

/** POST /choferes/{id}/foto (multipart, campo `archivo`) → 200 | 400 FOTO_INVALIDA */
export function subirFotoChofer(id: string, archivo: File, signal?: AbortSignal) {
  const datos = new FormData()
  datos.append('archivo', archivo)
  return solicitar<Chofer>({ method: 'POST', url: `/choferes/${id}/foto`, data: datos, signal }, clienteFlota)
}
