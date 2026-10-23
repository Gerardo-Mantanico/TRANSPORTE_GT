import { clienteAlquileres, limpiarParametros, solicitar } from '../../api/clienteHttp'
import { normalizarPagina, type PaginaCruda } from '../../api/paginacion'
import type { Pagina } from '../../types/pagina'
import type {
  Alquiler,
  CotizacionRequest,
  FiltroAlquileres,
  FiltroMisAlquileres,
  PagoAlquilerRequest,
  SolicitudAlquilerRequest,
  SolicitudMostradorRequest,
} from '../../types/rentalTypes'

/**
 * POST /alquileres/solicitudes → 201 SOLICITADO con precio estimado | 400 fechas o sin distancia
 * | 422 PERFIL_INCOMPLETO / COORDENADAS_INCOMPLETAS / COORDENADAS_INVALIDAS / SIN_TARIFA.
 * El NIT y el nombre salen del perfil del cliente.
 */
export function solicitarAlquiler(datos: SolicitudAlquilerRequest, signal?: AbortSignal) {
  return solicitar<Alquiler>({ method: 'POST', url: '/alquileres/solicitudes', data: datos, signal }, clienteAlquileres)
}

/** POST /alquileres/mostrador → 201 | 400 NIT_INVALIDO / VALIDACION_FALLIDA (nombre obligatorio). SUC y CAJ. */
export function solicitarAlquilerMostrador(datos: SolicitudMostradorRequest, signal?: AbortSignal) {
  return solicitar<Alquiler>({ method: 'POST', url: '/alquileres/mostrador', data: datos, signal }, clienteAlquileres)
}

/** POST /alquileres/{id}/cotizacion → 200 COTIZADO | 400 llegada inválida | 403 otra sucursal | 409. Solo SUC. */
export function cotizarAlquiler(id: string, datos: CotizacionRequest, signal?: AbortSignal) {
  return solicitar<Alquiler>(
    { method: 'POST', url: `/alquileres/${id}/cotizacion`, data: datos, signal },
    clienteAlquileres,
  )
}

/**
 * POST /alquileres/{id}/pago → 200 CONFIRMADO | 403 no es el dueño | 409 no está COTIZADO
 * | 422 SALDO_INSUFICIENTE (u otro rechazo de Cartera) | 503 Cartera no disponible (sigue COTIZADO).
 */
export function pagarAlquilerEnLinea(id: string, datos: PagoAlquilerRequest, signal?: AbortSignal) {
  return solicitar<Alquiler>({ method: 'POST', url: `/alquileres/${id}/pago`, data: datos, signal }, clienteAlquileres)
}

/** POST /alquileres/{id}/pago-mostrador → 200 CONFIRMADO (efectivo, sin cartera). SUC y CAJ de la sucursal. */
export function pagarAlquilerMostrador(id: string, datos: PagoAlquilerRequest, signal?: AbortSignal) {
  return solicitar<Alquiler>(
    { method: 'POST', url: `/alquileres/${id}/pago-mostrador`, data: datos, signal },
    clienteAlquileres,
  )
}

/** GET /alquileres/mios?pagina&tamano → 200. En línea del usuario y los de mostrador con el NIT de su perfil. */
export async function listarMisAlquileres(filtro: FiltroMisAlquileres = {}, signal?: AbortSignal): Promise<Pagina<Alquiler>> {
  const cruda = await solicitar<PaginaCruda<Alquiler>>(
    { method: 'GET', url: '/alquileres/mios', params: limpiarParametros(filtro), signal },
    clienteAlquileres,
  )
  return normalizarPagina(cruda)
}

/** GET /alquileres?estado&desde&hasta&sinAsignar&pagina&tamano → 200. SUC y CAJ su sucursal; SIS todas. */
export async function listarAlquileres(filtro: FiltroAlquileres = {}, signal?: AbortSignal): Promise<Pagina<Alquiler>> {
  const cruda = await solicitar<PaginaCruda<Alquiler>>(
    { method: 'GET', url: '/alquileres', params: limpiarParametros(filtro), signal },
    clienteAlquileres,
  )
  return normalizarPagina(cruda)
}

/** GET /alquileres/{id} → 200 con el historial de cotizaciones | 403 no le pertenece | 404 */
export function obtenerAlquiler(id: string, signal?: AbortSignal) {
  return solicitar<Alquiler>({ method: 'GET', url: `/alquileres/${id}`, signal }, clienteAlquileres)
}
