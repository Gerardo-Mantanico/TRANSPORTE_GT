import { useConsulta } from '../useConsulta'
import { obtenerFotoUrl } from '../../services/fleet'

/** Object URL de una foto privada de Flota (`fotoUrl` de un bus o chofer); `datos` es null sin foto. */
export function useFotoPrivada(ruta: string | null | undefined) {
  return useConsulta((signal) => obtenerFotoUrl(ruta ?? '', signal), ruta ?? '', Boolean(ruta))
}
