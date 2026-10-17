import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import {
  activarSucursal,
  actualizarSucursal,
  crearSucursal,
  desactivarSucursal,
  listarAdministradoresSucursal,
  listarSucursales,
  obtenerSucursal,
} from '../../services/identity'
import type { CrearSucursalRequest, DatosSucursal, FiltroSucursales } from '../../types/identityTypes'

export function useSucursales(filtro: FiltroSucursales, habilitada = true) {
  return useConsulta((signal) => listarSucursales(filtro, signal), JSON.stringify(filtro), habilitada)
}

export function useSucursal(id: string | null | undefined) {
  return useConsulta((signal) => obtenerSucursal(id ?? '', signal), id ?? '', Boolean(id))
}

export function useAdministradoresSucursal(id: string | null | undefined) {
  return useConsulta((signal) => listarAdministradoresSucursal(id ?? '', signal), id ?? '', Boolean(id))
}

const crear = (datos: CrearSucursalRequest, signal: AbortSignal) => crearSucursal(datos, signal)

const editar = (
  { id, sucursal, version }: { id: string; sucursal: DatosSucursal; version: number | null },
  signal: AbortSignal,
) => actualizarSucursal(id, sucursal, version, signal)

const cambiarEstado = ({ id, activa }: { id: string; activa: boolean }, signal: AbortSignal) =>
  activa ? activarSucursal(id, signal) : desactivarSucursal(id, signal)

export function useCrearSucursal() {
  return useMutacion(crear)
}

/** PUT con bloqueo optimista: envíe la `version` que leyó. */
export function useEditarSucursal() {
  return useMutacion(editar)
}

/** `ejecutar({ id, activa: true })` activa; `activa: false` desactiva. */
export function useCambiarEstadoSucursal() {
  return useMutacion(cambiarEstado)
}
