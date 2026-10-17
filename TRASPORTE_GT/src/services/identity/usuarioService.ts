import { limpiarParametros, solicitar } from '../../api/clienteHttp'
import { normalizarPagina, type PaginaCruda } from '../../api/paginacion'
import type { Pagina } from '../../types/pagina'
import type {
  ActualizarPerfilRequest,
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  FiltroUsuarios,
  Usuario,
} from '../../types/identityTypes'

/** POST /usuarios → 201. El usuario recibe un enlace de activación. */
export function crearUsuario(datos: CrearUsuarioRequest, signal?: AbortSignal) {
  return solicitar<Usuario>({ method: 'POST', url: '/usuarios', data: datos, signal })
}

/** GET /usuarios?rol&idSucursal&activo&texto&page&size&sort → 200 paginado */
export async function listarUsuarios(filtro: FiltroUsuarios = {}, signal?: AbortSignal): Promise<Pagina<Usuario>> {
  const cruda = await solicitar<PaginaCruda<Usuario>>({
    method: 'GET',
    url: '/usuarios',
    params: limpiarParametros(filtro),
    signal,
  })
  return normalizarPagina(cruda)
}

/** GET /usuarios/{id} → 200 */
export function obtenerUsuario(id: string, signal?: AbortSignal) {
  return solicitar<Usuario>({ method: 'GET', url: `/usuarios/${id}`, signal })
}

/** PUT /usuarios/{id} → 200 | 409 si `version` ya no es la actual */
export function actualizarUsuario(id: string, datos: ActualizarUsuarioRequest, signal?: AbortSignal) {
  return solicitar<Usuario>({
    method: 'PUT',
    url: `/usuarios/${id}`,
    data: { ...datos, version: datos.version ?? null },
    signal,
  })
}

/** POST /usuarios/{id}/reenviar-activacion → 202 sin cuerpo */
export function reenviarActivacion(id: string, signal?: AbortSignal) {
  return solicitar<void>({ method: 'POST', url: `/usuarios/${id}/reenviar-activacion`, signal })
}

/** PATCH /usuarios/{id}/activar → 200 */
export function activarUsuario(id: string, signal?: AbortSignal) {
  return solicitar<Usuario>({ method: 'PATCH', url: `/usuarios/${id}/activar`, signal })
}

/** PATCH /usuarios/{id}/desactivar → 200 | 409 último administrador */
export function desactivarUsuario(id: string, signal?: AbortSignal) {
  return solicitar<Usuario>({ method: 'PATCH', url: `/usuarios/${id}/desactivar`, signal })
}

/** PUT /usuarios/yo → 200. Solo cambia el nombre del usuario autenticado. */
export function actualizarMiPerfil(datos: ActualizarPerfilRequest, signal?: AbortSignal) {
  return solicitar<Usuario>({ method: 'PUT', url: '/usuarios/yo', data: datos, signal })
}
