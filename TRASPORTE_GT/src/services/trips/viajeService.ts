import { clienteViajes, limpiarParametros, solicitar } from '../../api/clienteHttp'
import { normalizarPagina, type PaginaCruda } from '../../api/paginacion'
import type { Pagina } from '../../types/pagina'
import {
  MAX_IDS_RESUMEN,
  type AsignacionRequest,
  type FiltroListadoViajes,
  type LlegadaRequest,
  type RepublicacionViajesResponse,
  type SalidaRequest,
  type Viaje,
  type ViajeRegularRequest,
  type ViajeResumen,
  type ViajeUpdateRequest,
} from '../../types/tripTypes'

export async function obtenerResumenViajes(ids: string[], signal?: AbortSignal): Promise<ViajeResumen[]> {
  const unicos = [...new Set(ids)]
  if (!unicos.length) return []
  // Más de 100 viajes (no ocurre con las páginas del historial): se piden por bloques.
  const bloques: string[][] = []
  for (let inicio = 0; inicio < unicos.length; inicio += MAX_IDS_RESUMEN) {
    bloques.push(unicos.slice(inicio, inicio + MAX_IDS_RESUMEN))
  }
  const respuestas = await Promise.all(
    bloques.map((bloque) =>
      solicitar<ViajeResumen[]>(
        { method: 'GET', url: '/viajes/resumen', params: { ids: bloque.join(',') }, signal },
        clienteViajes,
      ),
    ),
  )
  return respuestas.flat()
}

/**
 * GET /viajes?tipoViaje&estado&idRuta&idSucursal&desde&hasta&sinAsignar&pagina&tamano → 200 paginado
 * (SIS, SUC, CAJ, CHO). SUC y CAJ ven su sucursal; CHO, sus viajes.
 */
export async function listarViajes(filtro: FiltroListadoViajes = {}, signal?: AbortSignal): Promise<Pagina<Viaje>> {
  const cruda = await solicitar<PaginaCruda<Viaje>>(
    { method: 'GET', url: '/viajes', params: limpiarParametros(filtro), signal },
    clienteViajes,
  )
  return normalizarPagina(cruda)
}

/** GET /viajes/{id} → 200 con registros de salida y llegada | 403 otra sucursal | 404 */
export function obtenerViaje(id: string, signal?: AbortSignal) {
  return solicitar<Viaje>({ method: 'GET', url: `/viajes/${id}`, signal }, clienteViajes)
}

/**
 * POST /viajes → 201 (viaje REGULAR) | 409 CONFLICTO_HORARIO / BUS_NO_DISPONIBLE / LICENCIA_VENCIDA ... Solo SUC.
 */
export function crearViaje(datos: ViajeRegularRequest, signal?: AbortSignal) {
  return solicitar<Viaje>({ method: 'POST', url: '/viajes', data: datos, signal }, clienteViajes)
}

/** PUT /viajes/{id} → 200 | 409 CAPACIDAD_INSUFICIENTE (boletos vendidos) / CONFLICTO_HORARIO | 503 Boletos */
export function actualizarViaje(id: string, datos: ViajeUpdateRequest, signal?: AbortSignal) {
  return solicitar<Viaje>({ method: 'PUT', url: `/viajes/${id}`, data: datos, signal }, clienteViajes)
}

/** PATCH /viajes/{id}/asignacion → 200 (alquiler pasa a PROGRAMADO) | 409 CAPACIDAD_INSUFICIENTE ... */
export function asignarRecursosViaje(id: string, datos: AsignacionRequest, signal?: AbortSignal) {
  return solicitar<Viaje>({ method: 'PATCH', url: `/viajes/${id}/asignacion`, data: datos, signal }, clienteViajes)
}

/** DELETE /viajes/{id} → 204 | 409 VIAJE_NO_ELIMINABLE. Anula los boletos y cancela el alquiler por eventos. */
export function eliminarViaje(id: string, signal?: AbortSignal) {
  return solicitar<void>({ method: 'DELETE', url: `/viajes/${id}`, signal }, clienteViajes)
}

/** POST /viajes/{id}/salida → 200 (EN_TRANSITO). Registro inmutable. SUC o el chofer del viaje. */
export function registrarSalida(id: string, datos: SalidaRequest, signal?: AbortSignal) {
  return solicitar<Viaje>({ method: 'POST', url: `/viajes/${id}/salida`, data: datos, signal }, clienteViajes)
}

/** POST /viajes/{id}/llegada → 200 (FINALIZADO). Registro inmutable. SUC o el chofer del viaje. */
export function registrarLlegada(id: string, datos: LlegadaRequest, signal?: AbortSignal) {
  return solicitar<Viaje>({ method: 'POST', url: `/viajes/${id}/llegada`, data: datos, signal }, clienteViajes)
}

/** POST /admin/republicar-eventos → 200. Solo ADMIN_SISTEMA. */
export function republicarEventosViajes(signal?: AbortSignal) {
  return solicitar<RepublicacionViajesResponse>(
    { method: 'POST', url: '/admin/republicar-eventos', signal },
    clienteViajes,
  )
}
