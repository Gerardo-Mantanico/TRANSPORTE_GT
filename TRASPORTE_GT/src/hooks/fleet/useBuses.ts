import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import {
  actualizarBus,
  cambiarActivoBus,
  cambiarEstadoOperativoBus,
  crearBus,
  listarBuses,
  obtenerBus,
  republicarEventosFlota,
  subirFotoBus,
} from '../../services/fleet'
import type {
  ActualizarBusRequest,
  CrearBusRequest,
  EstadoOperativo,
  FiltroBuses,
} from '../../types/fleetTypes'

export function useBuses(filtro: FiltroBuses) {
  return useConsulta((signal) => listarBuses(filtro, signal), JSON.stringify(filtro))
}

export function useBus(id: string | null | undefined) {
  return useConsulta((signal) => obtenerBus(id ?? '', signal), id ?? '', Boolean(id))
}

const crear = (datos: CrearBusRequest, signal: AbortSignal) => crearBus(datos, signal)
const editar = ({ id, ...datos }: ActualizarBusRequest & { id: string }, signal: AbortSignal) =>
  actualizarBus(id, datos, signal)
const cambiarActivo = (
  { id, activo, version }: { id: string; activo: boolean; version: number | null },
  signal: AbortSignal,
) => cambiarActivoBus(id, activo, version, signal)
const cambiarEstado = (
  { id, estadoOperativo, version }: { id: string; estadoOperativo: EstadoOperativo; version: number | null },
  signal: AbortSignal,
) => cambiarEstadoOperativoBus(id, estadoOperativo, version, signal)
const subirFoto = ({ id, archivo }: { id: string; archivo: File }, signal: AbortSignal) =>
  subirFotoBus(id, archivo, signal)
const republicar = (_: void, signal: AbortSignal) => republicarEventosFlota(signal)

export function useCrearBus() {
  return useMutacion(crear)
}

/** PUT con bloqueo optimista: envíe la `version` que leyó. */
export function useEditarBus() {
  return useMutacion(editar)
}

export function useCambiarActivoBus() {
  return useMutacion(cambiarActivo)
}

export function useCambiarEstadoOperativoBus() {
  return useMutacion(cambiarEstado)
}

export function useSubirFotoBus() {
  return useMutacion(subirFoto)
}

export function useRepublicarEventosFlota() {
  return useMutacion(republicar)
}
