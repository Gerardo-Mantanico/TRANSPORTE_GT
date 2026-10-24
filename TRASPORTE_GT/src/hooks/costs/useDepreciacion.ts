import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import {
  listarTarifasDepreciacion,
  obtenerResumenCostosViaje,
  registrarTarifaDepreciacion,
} from '../../services/costs'
import type { TarifaDepreciacionRequest } from '../../types/costsTypes'

export function useTarifasDepreciacion(habilitada = true) {
  return useConsulta((signal) => listarTarifasDepreciacion(signal), 'tarifas-depreciacion', habilitada)
}

const registrar = (datos: TarifaDepreciacionRequest, signal: AbortSignal) => registrarTarifaDepreciacion(datos, signal)

export function useRegistrarTarifaDepreciacion() {
  return useMutacion(registrar)
}

/** Solo tiene datos cuando el viaje ya registró su llegada. */
export function useResumenCostosViaje(idViaje: string | null | undefined, habilitada = true) {
  return useConsulta((signal) => obtenerResumenCostosViaje(idViaje ?? '', signal), idViaje ?? '', habilitada && Boolean(idViaje))
}
