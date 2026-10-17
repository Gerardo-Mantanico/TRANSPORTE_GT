import { limpiarParametros, solicitar } from '../../api/clienteHttp'
import { normalizarPagina, type PaginaCruda } from '../../api/paginacion'
import type { Pagina } from '../../types/pagina'
import type {
  CrearSucursalRequest,
  DatosSucursal,
  FiltroSucursales,
  Sucursal,
  SucursalCreada,
  Usuario,
} from '../../types/identityTypes'

/** POST /sucursales → 201. Crea la sucursal junto con su primer ADMIN_SUCURSAL. */
export function crearSucursal(datos: CrearSucursalRequest, signal?: AbortSignal) {
  return solicitar<SucursalCreada>({ method: 'POST', url: '/sucursales', data: datos, signal })
}

/** GET /sucursales?activa&nombre&page&size&sort → 200 paginado */
export async function listarSucursales(filtro: FiltroSucursales = {}, signal?: AbortSignal): Promise<Pagina<Sucursal>> {
  const cruda = await solicitar<PaginaCruda<Sucursal>>({
    method: 'GET',
    url: '/sucursales',
    params: limpiarParametros(filtro),
    signal,
  })
  return normalizarPagina(cruda)
}

/** GET /sucursales/{id} → 200 */
export function obtenerSucursal(id: string, signal?: AbortSignal) {
  return solicitar<Sucursal>({ method: 'GET', url: `/sucursales/${id}`, signal })
}

/** PUT /sucursales/{id} → 200 | 409 si `version` ya no es la actual */
export function actualizarSucursal(
  id: string,
  sucursal: DatosSucursal,
  version: number | null | undefined,
  signal?: AbortSignal,
) {
  return solicitar<Sucursal>({
    method: 'PUT',
    url: `/sucursales/${id}`,
    data: { sucursal, version: version ?? null },
    signal,
  })
}

/** PATCH /sucursales/{id}/activar → 200 */
export function activarSucursal(id: string, signal?: AbortSignal) {
  return solicitar<Sucursal>({ method: 'PATCH', url: `/sucursales/${id}/activar`, signal })
}

/** PATCH /sucursales/{id}/desactivar → 200 */
export function desactivarSucursal(id: string, signal?: AbortSignal) {
  return solicitar<Sucursal>({ method: 'PATCH', url: `/sucursales/${id}/desactivar`, signal })
}

/** GET /sucursales/{id}/administradores → 200 */
export function listarAdministradoresSucursal(id: string, signal?: AbortSignal) {
  return solicitar<Usuario[]>({ method: 'GET', url: `/sucursales/${id}/administradores`, signal })
}
