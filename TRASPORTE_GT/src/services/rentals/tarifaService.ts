import { clienteAlquileres, limpiarParametros, solicitar } from '../../api/clienteHttp'
import type { Tarifa, TarifaRequest } from '../../types/rentalTypes'

/** GET /alquileres/tarifas/vigente?fecha → 200 | 404 SIN_TARIFA. Cualquier usuario autenticado. */
export function obtenerTarifaVigente(fecha?: string, signal?: AbortSignal) {
  return solicitar<Tarifa>(
    { method: 'GET', url: '/alquileres/tarifas/vigente', params: limpiarParametros({ fecha }), signal },
    clienteAlquileres,
  )
}

/** GET /alquileres/tarifas → 200, de la más reciente a la más antigua. Solo ADMIN_SISTEMA. */
export function listarTarifas(signal?: AbortSignal) {
  return solicitar<Tarifa[]>({ method: 'GET', url: '/alquileres/tarifas', signal }, clienteAlquileres)
}

/** POST /alquileres/tarifas → 201 (reemplaza la de la misma fecha) | 400 vigencia en el pasado. Solo ADMIN_SISTEMA. */
export function registrarTarifa(datos: TarifaRequest, signal?: AbortSignal) {
  return solicitar<Tarifa>({ method: 'POST', url: '/alquileres/tarifas', data: datos, signal }, clienteAlquileres)
}
