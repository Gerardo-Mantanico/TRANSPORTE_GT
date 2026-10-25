import { clienteReportes, limpiarParametros, solicitar } from '../../api/clienteHttp'
import type { ReporteTabla } from '../../types/reportTypes'

/** GET de un reporte en JSON; quita los filtros vacíos. */
export function obtenerReporte<F>(url: string, filtro: object, signal?: AbortSignal) {
  return solicitar<ReporteTabla<F>>(
    { method: 'GET', url, params: limpiarParametros({ ...filtro, formato: 'json' }), signal },
    clienteReportes,
  )
}
