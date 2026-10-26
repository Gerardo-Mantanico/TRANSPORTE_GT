import { useConsulta } from '../useConsulta'
import { listarViajesALaVenta, obtenerMapaAsientos } from '../../services/tickets'
import type { FiltroViajes } from '../../types/ticketTypes'

export function useViajesALaVenta(filtro: FiltroViajes, habilitada = true) {
  return useConsulta((signal) => listarViajesALaVenta(filtro, signal), JSON.stringify(filtro), habilitada)
}

export function useMapaAsientos(idViaje: string | null | undefined) {
  return useConsulta((signal) => obtenerMapaAsientos(idViaje ?? '', signal), idViaje ?? '', Boolean(idViaje))
}
