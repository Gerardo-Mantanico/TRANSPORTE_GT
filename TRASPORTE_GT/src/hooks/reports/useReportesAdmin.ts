import { useReporte } from './useReporte'
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
  return useReporte('/reportes/ingresos', filtro, (signal) => obtenerReporteIngresos(filtro, signal))
}

export function useReporteGastos(filtro: FiltroPorSucursal) {
  return useReporte('/reportes/gastos', filtro, (signal) => obtenerReporteGastos(filtro, signal))
}

export function useReporteGanancias(filtro: FiltroPorSucursal) {
  return useReporte('/reportes/ganancias', filtro, (signal) => obtenerReporteGanancias(filtro, signal))
}

export function useReporteRutasDemandadas(filtro: FiltroFechas) {
  return useReporte('/reportes/rutas-demandadas', filtro, (signal) => obtenerReporteRutasDemandadas(filtro, signal))
}

export function useReporteTallerCategoria(filtro: FiltroTallerCategoria) {
  return useReporte('/reportes/gastos-taller-por-categoria', filtro, (signal) => obtenerReporteTallerCategoria(filtro, signal))
}

/** El mapa necesita sucursal: sin ella no consulta. */
export function useReporteMapaRutas(filtro: FiltroPorSucursal) {
  return useReporte('/reportes/mapa-rutas', filtro, (signal) => obtenerReporteMapaRutas(filtro, signal), Boolean(filtro.idSucursal))
}
