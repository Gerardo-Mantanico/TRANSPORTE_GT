import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import { listarPasajeros, registrarAbordaje } from '../../services/tickets'

export function usePasajeros(idViaje: string | null | undefined) {
  return useConsulta((signal) => listarPasajeros(idViaje ?? '', signal), idViaje ?? '', Boolean(idViaje))
}

const abordar = ({ idViaje, codigo }: { idViaje: string; codigo: string }, signal: AbortSignal) =>
  registrarAbordaje(idViaje, codigo, signal)

/** `datos.nuevo` es false si el pasajero ya había abordado. */
export function useRegistrarAbordaje() {
  return useMutacion(abordar)
}
