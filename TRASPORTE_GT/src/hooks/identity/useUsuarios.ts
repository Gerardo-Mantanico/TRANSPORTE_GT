import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import {
  activarUsuario,
  actualizarMiPerfil,
  actualizarUsuario,
  crearUsuario,
  desactivarUsuario,
  listarUsuarios,
  obtenerUsuario,
  reenviarActivacion,
} from '../../services/identity'
import type {
  ActualizarPerfilRequest,
  ActualizarUsuarioRequest,
  CrearUsuarioRequest,
  FiltroUsuarios,
} from '../../types/identityTypes'

export function useUsuarios(filtro: FiltroUsuarios) {
  return useConsulta((signal) => listarUsuarios(filtro, signal), JSON.stringify(filtro))
}

export function useUsuario(id: string | null | undefined) {
  return useConsulta((signal) => obtenerUsuario(id ?? '', signal), id ?? '', Boolean(id))
}

const crear = (datos: CrearUsuarioRequest, signal: AbortSignal) => crearUsuario(datos, signal)

const editar = ({ id, ...datos }: ActualizarUsuarioRequest & { id: string }, signal: AbortSignal) =>
  actualizarUsuario(id, datos, signal)

const cambiarEstado = ({ id, activo }: { id: string; activo: boolean }, signal: AbortSignal) =>
  activo ? activarUsuario(id, signal) : desactivarUsuario(id, signal)

const reenviar = (id: string, signal: AbortSignal) => reenviarActivacion(id, signal)

const editarMiPerfil = (datos: ActualizarPerfilRequest, signal: AbortSignal) => actualizarMiPerfil(datos, signal)

export function useCrearUsuario() {
  return useMutacion(crear)
}

/** PUT con bloqueo optimista: envíe la `version` que leyó. */
export function useEditarUsuario() {
  return useMutacion(editar)
}

/** `ejecutar({ id, activo: true })` activa; `activo: false` desactiva. */
export function useCambiarEstadoUsuario() {
  return useMutacion(cambiarEstado)
}

export function useReenviarActivacion() {
  return useMutacion(reenviar)
}

export function useEditarMiPerfil() {
  return useMutacion(editarMiPerfil)
}
