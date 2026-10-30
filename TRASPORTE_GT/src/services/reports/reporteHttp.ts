import { clienteReportes, limpiarParametros, solicitar } from '../../api/clienteHttp'
import type { ReporteTabla } from '../../types/reportTypes'
import { guardarArchivo } from '../../utils/descargas'

/** GET de un reporte en JSON; quita los filtros vacíos. */
export function obtenerReporte<F>(url: string, filtro: object, signal?: AbortSignal) {
  return solicitar<ReporteTabla<F>>(
    { method: 'GET', url, params: limpiarParametros({ ...filtro, formato: 'json' }), signal },
    clienteReportes,
  )
}

/** Descarga la versión generada por JasperReports en el backend. */
export async function descargarReportePdfJasper(url: string, filtro: object, signal?: AbortSignal) {
  const respuesta = await clienteReportes.get<Blob>(url, {
    params: limpiarParametros({ ...filtro, formato: 'pdf' }),
    headers: { Accept: 'application/pdf, application/json' },
    responseType: 'blob',
    signal,
  })
  const disposicion = respuesta.headers['content-disposition'] as string | undefined
  const nombre = disposicion?.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i)?.[1]
  guardarArchivo(respuesta.data, nombre ? decodeURIComponent(nombre.replaceAll('"', '')) : 'reporte-jasper.pdf')
}
