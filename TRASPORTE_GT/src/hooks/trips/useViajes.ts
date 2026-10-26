import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import {
  actualizarViaje,
  asignarRecursosViaje,
  crearViaje,
  eliminarViaje,
  listarViajes,
  obtenerViaje,
  registrarLlegada,
  registrarSalida,
  republicarEventosViajes,
} from '../../services/trips'
import type {
  AsignacionRequest,
  FiltroListadoViajes,
  LlegadaRequest,
  SalidaRequest,
  ViajeRegularRequest,
  ViajeUpdateRequest,
} from '../../types/tripTypes'

export function useViajes(filtro: FiltroListadoViajes) {
  return useConsulta((signal) => listarViajes(filtro, signal), JSON.stringify(filtro))
}

export function useViaje(id: string | null | undefined) {
  return useConsulta((signal) => obtenerViaje(id ?? '', signal), id ?? '', Boolean(id))
}

const crear = (datos: ViajeRegularRequest, signal: AbortSignal) => crearViaje(datos, signal)
const editar = ({ id, ...datos }: ViajeUpdateRequest & { id: string }, signal: AbortSignal) =>
  actualizarViaje(id, datos, signal)
const asignar = ({ id, ...datos }: AsignacionRequest & { id: string }, signal: AbortSignal) =>
  asignarRecursosViaje(id, datos, signal)
const eliminar = (id: string, signal: AbortSignal) => eliminarViaje(id, signal)
const salida = ({ id, ...datos }: SalidaRequest & { id: string }, signal: AbortSignal) =>
  registrarSalida(id, datos, signal)
const llegada = ({ id, ...datos }: LlegadaRequest & { id: string }, signal: AbortSignal) =>
  registrarLlegada(id, datos, signal)
const republicar = (_: void, signal: AbortSignal) => republicarEventosViajes(signal)

export function useCrearViaje() {
  return useMutacion(crear)
}

export function useEditarViaje() {
  return useMutacion(editar)
}

export function useAsignarViaje() {
  return useMutacion(asignar)
}

export function useEliminarViaje() {
  return useMutacion(eliminar)
}

export function useRegistrarSalida() {
  return useMutacion(salida)
}

export function useRegistrarLlegada() {
  return useMutacion(llegada)
}

export function useRepublicarEventosViajes() {
  return useMutacion(republicar)
}
