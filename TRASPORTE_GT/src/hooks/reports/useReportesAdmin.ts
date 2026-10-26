import { useConsulta } from '../useConsulta'
import {
  obtenerReporteGanancias,
  obtenerReporteGastos,
  obtenerReporteIngresos,
  obtenerReporteMapaRutas,
  obtenerReporteRutasDemandadas,
  obtenerReporteTallerCategoria,
} from '../../services/reports'
import type { FiltroFechas, FiltroPorSucursal, FiltroTallerCategoria } from '../../types/reportTypes'

export function useReporteIngresos(filtro: FiltroPorSucursal) {
  return useConsulta((signal) => obtenerReporteIngresos(filtro, signal), JSON.stringify(filtro))
}

export function useReporteGastos(filtro: FiltroPorSucursal) {
  return useConsulta((signal) => obtenerReporteGastos(filtro, signal), JSON.stringify(filtro))
}

export function useReporteGanancias(filtro: FiltroPorSucursal) {
  return useConsulta((signal) => obtenerReporteGanancias(filtro, signal), JSON.stringify(filtro))
}

export function useReporteRutasDemandadas(filtro: FiltroFechas) {
  return useConsulta((signal) => obtenerReporteRutasDemandadas(filtro, signal), JSON.stringify(filtro))
}

export function useReporteTallerCategoria(filtro: FiltroTallerCategoria) {
  return useConsulta((signal) => obtenerReporteTallerCategoria(filtro, signal), JSON.stringify(filtro))
}

/** El mapa necesita sucursal: sin ella no consulta. */
export function useReporteMapaRutas(filtro: FiltroPorSucursal) {
  return useConsulta(
    (signal) => obtenerReporteMapaRutas(filtro, signal),
    JSON.stringify(filtro),
    Boolean(filtro.idSucursal),
  )
}
