import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import { descargarReportePdfJasper } from '../../services/reports/reporteHttp'
import type { ReporteTabla } from '../../types/reportTypes'

/** Consulta JSON y expone, con los mismos filtros, la descarga PDF de JasperReports. */
export function useReporte<F>(
  url: string,
  filtro: object,
  consultar: (signal: AbortSignal) => Promise<ReporteTabla<F>>,
  habilitada = true,
) {
  const clave = JSON.stringify(filtro)
  const consulta = useConsulta(consultar, clave, habilitada)
  const exportacionJasper = useMutacion((_: void, signal) => descargarReportePdfJasper(url, filtro, signal))
  return { ...consulta, exportacionJasper }
}
