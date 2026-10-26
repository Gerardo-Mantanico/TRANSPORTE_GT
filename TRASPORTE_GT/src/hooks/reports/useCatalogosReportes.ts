import { useConsulta } from '../useConsulta'
import { listarBusesReportes, listarRutasReportes, listarSucursalesReportes } from '../../services/reports'

/** Solo ADMIN_SISTEMA: `habilitada = false` para el administrador de sucursal. */
export function useSucursalesReportes(habilitada = true) {
  return useConsulta((signal) => listarSucursalesReportes(signal), 'sucursales', habilitada)
}

export function useRutasReportes(idSucursal?: string, habilitada = true) {
  return useConsulta((signal) => listarRutasReportes(idSucursal, signal), idSucursal ?? '', habilitada)
}

export function useBusesReportes(idSucursal?: string, habilitada = true) {
  return useConsulta((signal) => listarBusesReportes(idSucursal, signal), idSucursal ?? '', habilitada)
}
