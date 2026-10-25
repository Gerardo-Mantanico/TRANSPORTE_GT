import type {
  FilaBus,
  FilaChofer,
  FilaDepreciacionBus,
  FilaGastoTaller,
  FilaIngresoAlquiler,
  FilaIngresoBoleto,
  FiltroBuses,
  FiltroIngresosBoletos,
  FiltroSucursal,
  FiltroTallerBus,
} from '../../types/reportTypes'
import { obtenerReporte } from './reporteHttp'

/** GET /reportes/buses?estado → 200. SUC (su sucursal) y SIS (con idSucursal). */
export function obtenerReporteBuses(filtro: FiltroBuses, signal?: AbortSignal) {
  return obtenerReporte<FilaBus>('/reportes/buses', filtro, signal)
}

/** GET /reportes/choferes → 200. SUC y SIS. */
export function obtenerReporteChoferes(filtro: FiltroSucursal, signal?: AbortSignal) {
  return obtenerReporte<FilaChofer>('/reportes/choferes', filtro, signal)
}

/** GET /reportes/ingresos-boletos?idRuta&idBus → 200 | 403 ruta o bus de otra sucursal. SUC y SIS. */
export function obtenerReporteIngresosBoletos(filtro: FiltroIngresosBoletos, signal?: AbortSignal) {
  return obtenerReporte<FilaIngresoBoleto>('/reportes/ingresos-boletos', filtro, signal)
}

/** GET /reportes/ingresos-alquileres → 200. SUC y SIS. */
export function obtenerReporteIngresosAlquileres(filtro: FiltroSucursal, signal?: AbortSignal) {
  return obtenerReporte<FilaIngresoAlquiler>('/reportes/ingresos-alquileres', filtro, signal)
}

/** GET /reportes/depreciacion-buses → 200. SUC y SIS. */
export function obtenerReporteDepreciacionBuses(filtro: FiltroSucursal, signal?: AbortSignal) {
  return obtenerReporte<FilaDepreciacionBus>('/reportes/depreciacion-buses', filtro, signal)
}

/** GET /reportes/gastos-taller-por-bus?idBus → 200. SUC y SIS. */
export function obtenerReporteTallerBus(filtro: FiltroTallerBus, signal?: AbortSignal) {
  return obtenerReporte<FilaGastoTaller>('/reportes/gastos-taller-por-bus', filtro, signal)
}
