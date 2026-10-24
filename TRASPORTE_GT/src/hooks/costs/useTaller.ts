import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import { listarGastosTaller, obtenerGastoTaller, registrarGastoTaller } from '../../services/costs'
import type { FiltroTaller, GastoTallerRequest } from '../../types/costsTypes'

export function useGastosTaller(filtro: FiltroTaller) {
  return useConsulta((signal) => listarGastosTaller(filtro, signal), JSON.stringify(filtro))
}

export function useGastoTaller(id: string | null | undefined) {
  return useConsulta((signal) => obtenerGastoTaller(id ?? '', signal), id ?? '', Boolean(id))
}

const registrar = (datos: GastoTallerRequest, signal: AbortSignal) => registrarGastoTaller(datos, signal)

export function useRegistrarGastoTaller() {
  return useMutacion(registrar)
}
