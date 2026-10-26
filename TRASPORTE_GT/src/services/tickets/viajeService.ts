import { clienteBoletos, limpiarParametros, solicitar } from '../../api/clienteHttp'
import type { FiltroViajes, MapaAsientos, ViajeDisponible } from '../../types/ticketTypes'

/** GET /boletos/viajes?idOrigen&idRuta&destino&fecha → 200 (lista sin paginar, por hora de salida) */
export function listarViajesALaVenta(filtro: FiltroViajes = {}, signal?: AbortSignal) {
  return solicitar<ViajeDisponible[]>(
    { method: 'GET', url: '/boletos/viajes', params: limpiarParametros(filtro), signal },
    clienteBoletos,
  )
}

/** GET /boletos/viajes/{id}/asientos → 200 | 404 si el viaje no existe o se eliminó */
export function obtenerMapaAsientos(idViaje: string, signal?: AbortSignal) {
  return solicitar<MapaAsientos>({ method: 'GET', url: `/boletos/viajes/${idViaje}/asientos`, signal }, clienteBoletos)
}
