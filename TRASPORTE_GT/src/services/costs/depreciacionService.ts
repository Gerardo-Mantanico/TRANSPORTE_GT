import { clienteCostos, limpiarParametros, solicitar } from '../../api/clienteHttp'
import type { ResumenCostosViaje, TarifaDepreciacion, TarifaDepreciacionRequest } from '../../types/costsTypes'

/** GET /costos/depreciacion/tarifa-vigente?fecha → 200 | 404. SIS y SUC. */
export function obtenerTarifaDepreciacionVigente(fecha?: string, signal?: AbortSignal) {
  return solicitar<TarifaDepreciacion>(
    { method: 'GET', url: '/costos/depreciacion/tarifa-vigente', params: limpiarParametros({ fecha }), signal },
    clienteCostos,
  )
}

/** GET /costos/depreciacion/tarifas → 200. Solo SIS. */
export function listarTarifasDepreciacion(signal?: AbortSignal) {
  return solicitar<TarifaDepreciacion[]>({ method: 'GET', url: '/costos/depreciacion/tarifas', signal }, clienteCostos)
}

/** POST /costos/depreciacion/tarifas → 201. Solo SIS. No altera lo ya calculado. */
export function registrarTarifaDepreciacion(datos: TarifaDepreciacionRequest, signal?: AbortSignal) {
  return solicitar<TarifaDepreciacion>(
    { method: 'POST', url: '/costos/depreciacion/tarifas', data: datos, signal },
    clienteCostos,
  )
}

/** GET /costos/viajes/{idViaje} → 200: combustible, depreciación y salario del chofer de un viaje cerrado. */
export function obtenerResumenCostosViaje(idViaje: string, signal?: AbortSignal) {
  return solicitar<ResumenCostosViaje>({ method: 'GET', url: `/costos/viajes/${idViaje}`, signal }, clienteCostos)
}
