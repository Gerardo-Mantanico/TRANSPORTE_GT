import type {
  FilaGanancia,
  FilaGasto,
  FilaGastoTaller,
  FilaIngreso,
  FilaMapaRuta,
  FilaRutaDemandada,
  FiltroFechas,
  FiltroPorSucursal,
  FiltroTallerCategoria,
} from '../../types/reportTypes'
import { obtenerReporte } from './reporteHttp'

/** GET /reportes/ingresos?desde&hasta&idSucursal → 200. Solo SIS. */
export function obtenerReporteIngresos(filtro: FiltroPorSucursal, signal?: AbortSignal) {
  return obtenerReporte<FilaIngreso>('/reportes/ingresos', filtro, signal)
}

/** GET /reportes/gastos?desde&hasta&idSucursal → 200. Solo SIS. */
export function obtenerReporteGastos(filtro: FiltroPorSucursal, signal?: AbortSignal) {
  return obtenerReporte<FilaGasto>('/reportes/gastos', filtro, signal)
}

/** GET /reportes/ganancias?desde&hasta&idSucursal → 200. Solo SIS. */
export function obtenerReporteGanancias(filtro: FiltroPorSucursal, signal?: AbortSignal) {
  return obtenerReporte<FilaGanancia>('/reportes/ganancias', filtro, signal)
}

/** GET /reportes/rutas-demandadas?desde&hasta → 200. Solo SIS. */
export function obtenerReporteRutasDemandadas(filtro: FiltroFechas, signal?: AbortSignal) {
  return obtenerReporte<FilaRutaDemandada>('/reportes/rutas-demandadas', filtro, signal)
}

/** GET /reportes/gastos-taller-por-categoria?desde&hasta&idSucursal&idBus → 200. Solo SIS. */
export function obtenerReporteTallerCategoria(filtro: FiltroTallerCategoria, signal?: AbortSignal) {
  return obtenerReporte<FilaGastoTaller>('/reportes/gastos-taller-por-categoria', filtro, signal)
}

/** GET /reportes/mapa-rutas?idSucursal → 200 | 400 sin sucursal. Solo SIS. */
export function obtenerReporteMapaRutas(filtro: FiltroPorSucursal, signal?: AbortSignal) {
  return obtenerReporte<FilaMapaRuta>('/reportes/mapa-rutas', filtro, signal)
}
