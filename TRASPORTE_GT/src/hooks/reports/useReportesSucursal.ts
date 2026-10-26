import { useConsulta } from '../useConsulta'
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
  return useConsulta((signal) => obtenerReporteBuses(filtro, signal), JSON.stringify(filtro), habilitada)
}

export function useReporteChoferes(filtro: FiltroSucursal, habilitada = true) {
  return useConsulta((signal) => obtenerReporteChoferes(filtro, signal), JSON.stringify(filtro), habilitada)
}

export function useReporteIngresosBoletos(filtro: FiltroIngresosBoletos, habilitada = true) {
  return useConsulta((signal) => obtenerReporteIngresosBoletos(filtro, signal), JSON.stringify(filtro), habilitada)
}

export function useReporteIngresosAlquileres(filtro: FiltroSucursal, habilitada = true) {
  return useConsulta(
    (signal) => obtenerReporteIngresosAlquileres(filtro, signal),
    JSON.stringify(filtro),
    habilitada,
  )
}

export function useReporteDepreciacionBuses(filtro: FiltroSucursal, habilitada = true) {
  return useConsulta(
    (signal) => obtenerReporteDepreciacionBuses(filtro, signal),
    JSON.stringify(filtro),
    habilitada,
  )
}

export function useReporteTallerBus(filtro: FiltroTallerBus, habilitada = true) {
  return useConsulta((signal) => obtenerReporteTallerBus(filtro, signal), JSON.stringify(filtro), habilitada)
}
