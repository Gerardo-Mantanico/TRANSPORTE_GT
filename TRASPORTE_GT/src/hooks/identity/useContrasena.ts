import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import {
  cambiarContrasena,
  consultarEnlace,
  olvideContrasena,
  registrar,
  restablecerContrasena,
} from '../../services/identity'
import type {
  CambiarContrasenaRequest,
  OlvideContrasenaRequest,
  RegistroRequest,
  RestablecerContrasenaRequest,
} from '../../types/identityTypes'

/** `datos` es el enlace si está vigente, `null` si venció o ya se usó (410). */
export function useEnlaceContrasena(token: string | null) {
  return useConsulta((signal) => consultarEnlace(token ?? '', signal), token ?? '', Boolean(token))
}

const cambiar = (datos: CambiarContrasenaRequest, signal: AbortSignal) => cambiarContrasena(datos, signal)
const olvide = (datos: OlvideContrasenaRequest, signal: AbortSignal) => olvideContrasena(datos, signal)
const restablecer = (datos: RestablecerContrasenaRequest, signal: AbortSignal) =>
  restablecerContrasena(datos, signal)
const registro = (datos: RegistroRequest, signal: AbortSignal) => registrar(datos, signal)

export function useCambiarContrasena() {
  return useMutacion(cambiar)
}

export function useOlvideContrasena() {
  return useMutacion(olvide)
}

/** Define la contraseña con un enlace de RESTABLECIMIENTO o de ACTIVACION. */
export function useRestablecerContrasena() {
  return useMutacion(restablecer)
}

export function useRegistro() {
  return useMutacion(registro)
}
