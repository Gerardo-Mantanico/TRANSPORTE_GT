import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import { actualizarRuta, crearRuta, eliminarRuta, listarRutas, obtenerRuta } from '../../services/trips'
import type { FiltroRutas, RutaRequest } from '../../types/tripTypes'

export function useRutas(filtro: FiltroRutas, habilitada = true) {
  return useConsulta((signal) => listarRutas(filtro, signal), JSON.stringify(filtro), habilitada)
}

export function useRuta(id: string | null | undefined) {
  return useConsulta((signal) => obtenerRuta(id ?? '', signal), id ?? '', Boolean(id))
}

const crear = (datos: RutaRequest, signal: AbortSignal) => crearRuta(datos, signal)
const editar = ({ id, ...datos }: RutaRequest & { id: string }, signal: AbortSignal) => actualizarRuta(id, datos, signal)
const eliminar = (id: string, signal: AbortSignal) => eliminarRuta(id, signal)

export function useCrearRuta() {
  return useMutacion(crear)
}

export function useEditarRuta() {
  return useMutacion(editar)
}

export function useEliminarRuta() {
  return useMutacion(eliminar)
}
