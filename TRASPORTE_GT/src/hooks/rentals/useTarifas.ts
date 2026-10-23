import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import { listarTarifas, obtenerTarifaVigente, registrarTarifa } from '../../services/rentals'
import type { TarifaRequest } from '../../types/rentalTypes'

/** Tarifa vigente a `fecha` (`YYYY-MM-DD`), o hoy en Guatemala. */
export function useTarifaVigente(fecha?: string, habilitada = true) {
  return useConsulta((signal) => obtenerTarifaVigente(fecha, signal), fecha ?? 'hoy', habilitada)
}

export function useTarifas(habilitada = true) {
  return useConsulta((signal) => listarTarifas(signal), 'tarifas', habilitada)
}

const registrar = (datos: TarifaRequest, signal: AbortSignal) => registrarTarifa(datos, signal)

export function useRegistrarTarifa() {
  return useMutacion(registrar)
}
