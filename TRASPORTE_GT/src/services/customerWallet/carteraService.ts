import { clienteClientes, limpiarParametros, solicitar } from '../../api/clienteHttp'
import { normalizarPagina, type PaginaCruda } from '../../api/paginacion'
import type { Pagina } from '../../types/pagina'
import type { Cartera, FiltroMovimientos, Movimiento, RecargaRequest } from '../../types/customerWalletTypes'

export const CABECERA_IDEMPOTENCIA = 'Clave-Idempotencia'

/** GET /cartera/yo → 200 | 404 si el perfil aún no existe */
export function obtenerMiCartera(signal?: AbortSignal) {
  return solicitar<Cartera>({ method: 'GET', url: '/cartera/yo', signal }, clienteClientes)
}

/**
 * POST /cartera/recargas → 201 recarga aplicada | 200 la clave ya existía (recarga original)
 * | 403 cuenta desactivada | 409 clave usada con otro monto.
 * Reenvíe la misma `claveIdempotencia` al reintentar la misma recarga.
 */
export function recargarCartera(datos: RecargaRequest, claveIdempotencia: string, signal?: AbortSignal) {
  return solicitar<Movimiento>(
    {
      method: 'POST',
      url: '/cartera/recargas',
      data: datos,
      headers: { [CABECERA_IDEMPOTENCIA]: claveIdempotencia },
      signal,
    },
    clienteClientes,
  )
}

/** GET /cartera/yo/movimientos?tipo&desde&hasta&pagina&tamano → 200 paginado, el más reciente primero */
export async function listarMovimientos(filtro: FiltroMovimientos = {}, signal?: AbortSignal): Promise<Pagina<Movimiento>> {
  const cruda = await solicitar<PaginaCruda<Movimiento>>(
    { method: 'GET', url: '/cartera/yo/movimientos', params: limpiarParametros(filtro), signal },
    clienteClientes,
  )
  return normalizarPagina(cruda)
}
