import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import {
  actualizarChofer,
  cambiarActivoChofer,
  crearChofer,
  listarChoferes,
  obtenerChofer,
  subirFotoChofer,
} from '../../services/fleet'
import type { ActualizarChoferRequest, CrearChoferRequest, FiltroChoferes } from '../../types/fleetTypes'

export function useChoferes(filtro: FiltroChoferes) {
  return useConsulta((signal) => listarChoferes(filtro, signal), JSON.stringify(filtro))
}

export function useChofer(id: string | null | undefined) {
  return useConsulta((signal) => obtenerChofer(id ?? '', signal), id ?? '', Boolean(id))
}

const crear = (datos: CrearChoferRequest, signal: AbortSignal) => crearChofer(datos, signal)
const editar = ({ id, ...datos }: ActualizarChoferRequest & { id: string }, signal: AbortSignal) =>
  actualizarChofer(id, datos, signal)
const cambiarActivo = (
  { id, activo, version }: { id: string; activo: boolean; version: number | null },
  signal: AbortSignal,
) => cambiarActivoChofer(id, activo, version, signal)
const subirFoto = ({ id, archivo }: { id: string; archivo: File }, signal: AbortSignal) =>
  subirFotoChofer(id, archivo, signal)

export function useCrearChofer() {
  return useMutacion(crear)
}

/** PUT con bloqueo optimista: envíe la `version` que leyó. */
export function useEditarChofer() {
  return useMutacion(editar)
}

export function useCambiarActivoChofer() {
  return useMutacion(cambiarActivo)
}

export function useSubirFotoChofer() {
  return useMutacion(subirFoto)
}
