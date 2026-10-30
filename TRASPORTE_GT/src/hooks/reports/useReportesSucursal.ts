import { useReporte } from './useReporte'
import {
  obtenerReporteBuses,
  obtenerReporteChoferes,
  obtenerReporteDepreciacionBuses,
  obtenerReporteIngresosAlquileres,
  obtenerReporteIngresosBoletos,
  obtenerReporteTallerBus,
} from '../../services/reports'
import type {
  FiltroBuses,
  FiltroIngresosBoletos,
  FiltroSucursal,
  FiltroTallerBus,
} from '../../types/reportTypes'

/**
 * `habilitada = false` mientras el ADMIN_SISTEMA no elige sucursal (el backend respondería 400).
 */
export function useReporteBuses(filtro: FiltroBuses, habilitada = true) {
  return useReporte('/reportes/buses', filtro, (signal) => obtenerReporteBuses(filtro, signal), habilitada)
}

export function useReporteChoferes(filtro: FiltroSucursal, habilitada = true) {
  return useReporte('/reportes/choferes', filtro, (signal) => obtenerReporteChoferes(filtro, signal), habilitada)
}

export function useReporteIngresosBoletos(filtro: FiltroIngresosBoletos, habilitada = true) {
  return useReporte('/reportes/ingresos-boletos', filtro, (signal) => obtenerReporteIngresosBoletos(filtro, signal), habilitada)
}

export function useReporteIngresosAlquileres(filtro: FiltroSucursal, habilitada = true) {
  return useReporte('/reportes/ingresos-alquileres', filtro,
    (signal) => obtenerReporteIngresosAlquileres(filtro, signal), habilitada)
}

export function useReporteDepreciacionBuses(filtro: FiltroSucursal, habilitada = true) {
  return useReporte('/reportes/depreciacion-buses', filtro,
    (signal) => obtenerReporteDepreciacionBuses(filtro, signal), habilitada)
}

export function useReporteTallerBus(filtro: FiltroTallerBus, habilitada = true) {
  return useReporte('/reportes/gastos-taller-por-bus', filtro,
    (signal) => obtenerReporteTallerBus(filtro, signal), habilitada)
}
