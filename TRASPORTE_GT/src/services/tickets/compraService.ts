import { clienteBoletos, limpiarParametros, solicitar } from '../../api/clienteHttp'
import { normalizarPagina, type PaginaCruda } from '../../api/paginacion'
import type { Pagina } from '../../types/pagina'
import type {
  Compra,
  CompraEnLinea,
  CompraRequest,
  FiltroComprasSucursal,
  FiltroMisCompras,
  ResultadoCompra,
  VentaMostradorRequest,
} from '../../types/ticketTypes'

const RESULTADO_POR_ESTADO: Record<number, ResultadoCompra> = {
  200: 'EXISTENTE',
  201: 'CONFIRMADA',
  202: 'PENDIENTE',
}

/**
 * POST /boletos/compras → 201 confirmada | 200 idCompra repetido ya confirmado | 202 RESERVADA (Cartera no
 * respondió) | 409 asiento ocupado | 422 saldo insuficiente o perfil sin NIT.
 * Reenviar el mismo `idCompra` es seguro: si sigue RESERVADA vuelve a intentar el cobro sin cobrar dos veces.
 */
export async function comprarEnLinea(datos: CompraRequest, signal?: AbortSignal): Promise<CompraEnLinea> {
  const respuesta = await clienteBoletos.request<Compra>({ method: 'POST', url: '/boletos/compras', data: datos, signal })
  return { compra: respuesta.data, resultado: RESULTADO_POR_ESTADO[respuesta.status] ?? 'CONFIRMADA' }
}

/** GET /boletos/compras/mias?estado&pagina&tamano → 200. Incluye las ventas de mostrador con el NIT del usuario. */
export async function listarMisCompras(filtro: FiltroMisCompras = {}, signal?: AbortSignal): Promise<Pagina<Compra>> {
  const cruda = await solicitar<PaginaCruda<Compra>>(
    { method: 'GET', url: '/boletos/compras/mias', params: limpiarParametros(filtro), signal },
    clienteBoletos,
  )
  return normalizarPagina(cruda)
}

/** GET /boletos/compras/{id} → 200 | 404 si no existe o no le corresponde */
export function obtenerCompra(idCompra: string, signal?: AbortSignal) {
  return solicitar<Compra>({ method: 'GET', url: `/boletos/compras/${idCompra}`, signal }, clienteBoletos)
}

/** GET /boletos/compras?idViaje&estado&pagina&tamano → 200. Solo CAJERO y ADMIN_SUCURSAL (su sucursal). */
export async function listarComprasSucursal(
  filtro: FiltroComprasSucursal = {},
  signal?: AbortSignal,
): Promise<Pagina<Compra>> {
  const cruda = await solicitar<PaginaCruda<Compra>>(
    { method: 'GET', url: '/boletos/compras', params: limpiarParametros(filtro), signal },
    clienteBoletos,
  )
  return normalizarPagina(cruda)
}

/**
 * POST /boletos/ventas-mostrador → 201 | 200 idCompra repetido | 400 asientos o NIT inválidos
 * | 403 viaje de otra sucursal | 409 asiento ocupado. No usa la cartera.
 */
export function venderEnMostrador(datos: VentaMostradorRequest, signal?: AbortSignal) {
  return solicitar<Compra>({ method: 'POST', url: '/boletos/ventas-mostrador', data: datos, signal }, clienteBoletos)
}
