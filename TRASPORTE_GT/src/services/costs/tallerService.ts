import { clienteCostos, limpiarParametros, solicitar } from '../../api/clienteHttp'
import { normalizarPagina, type PaginaCruda } from '../../api/paginacion'
import type { Pagina } from '../../types/pagina'
import type { FiltroTaller, GastoTaller, GastoTallerRequest } from '../../types/costsTypes'

/** GET /costos/taller?idBus&desde&hasta&pagina&tamano → 200 con sus líneas. SUC (su sucursal) y SIS. */
export async function listarGastosTaller(filtro: FiltroTaller = {}, signal?: AbortSignal): Promise<Pagina<GastoTaller>> {
  const cruda = await solicitar<PaginaCruda<GastoTaller>>(
    { method: 'GET', url: '/costos/taller', params: limpiarParametros(filtro), signal },
    clienteCostos,
  )
  return normalizarPagina(cruda)
}

/** GET /costos/taller/{id} → 200 | 403 otra sucursal | 404 */
export function obtenerGastoTaller(id: string, signal?: AbortSignal) {
  return solicitar<GastoTaller>({ method: 'GET', url: `/costos/taller/${id}`, signal }, clienteCostos)
}

/** POST /costos/taller → 201. Inmutable; solo SUC. Publica GastoTallerRegistrado. */
export function registrarGastoTaller(datos: GastoTallerRequest, signal?: AbortSignal) {
  return solicitar<GastoTaller>({ method: 'POST', url: '/costos/taller', data: datos, signal }, clienteCostos)
}
