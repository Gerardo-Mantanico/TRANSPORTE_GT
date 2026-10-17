import { useMutacion } from '../useMutacion'
import { republicarEventos } from '../../services/identity'

const republicar = (_: void, signal: AbortSignal) => republicarEventos(signal)

export function useRepublicarEventos() {
  return useMutacion(republicar)
}
