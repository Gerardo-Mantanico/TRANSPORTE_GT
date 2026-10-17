import { ApiError } from '../../api/ApiError'
import { solicitar } from '../../api/clienteHttp'
import type {
  CambiarContrasenaRequest,
  EnlaceContrasena,
  LoginRequest,
  LoginResponse,
  MensajeResponse,
  OlvideContrasenaRequest,
  RegistroRequest,
  RestablecerContrasenaRequest,
  Usuario,
} from '../../types/identityTypes'

/** POST /auth/login → 200 | 401 credenciales | 403 usuario inactivo */
export function login(datos: LoginRequest, signal?: AbortSignal) {
  return solicitar<LoginResponse>({ method: 'POST', url: '/auth/login', data: datos, publica: true, signal })
}

/** POST /auth/registro → 201 (autorregistro de CLIENTE) */
export function registrar(datos: RegistroRequest, signal?: AbortSignal) {
  return solicitar<Usuario>({ method: 'POST', url: '/auth/registro', data: datos, publica: true, signal })
}

/** GET /auth/yo → 200 */
export function obtenerYo(signal?: AbortSignal) {
  return solicitar<Usuario>({ method: 'GET', url: '/auth/yo', signal })
}

/** POST /auth/cambiar-contrasena → 200 | 422 contraseña actual incorrecta */
export function cambiarContrasena(datos: CambiarContrasenaRequest, signal?: AbortSignal) {
  return solicitar<MensajeResponse>({ method: 'POST', url: '/auth/cambiar-contrasena', data: datos, signal })
}

/** POST /auth/olvide-contrasena → siempre 202 */
export function olvideContrasena(datos: OlvideContrasenaRequest, signal?: AbortSignal) {
  return solicitar<MensajeResponse>({
    method: 'POST',
    url: '/auth/olvide-contrasena',
    data: datos,
    publica: true,
    signal,
  })
}

/**
 * GET /auth/enlace-contrasena/validar → 200 con el propósito si el enlace está vigente,
 * `null` si respondió 410 (usado, reemplazado o vencido).
 */
export async function consultarEnlace(token: string, signal?: AbortSignal): Promise<EnlaceContrasena | null> {
  try {
    return await solicitar<EnlaceContrasena>({
      method: 'GET',
      url: '/auth/enlace-contrasena/validar',
      params: { token },
      publica: true,
      signal,
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 410) return null
    throw error
  }
}

/** Igual que `consultarEnlace`, pero solo dice si el enlace sigue vigente (200) o no (410). */
export async function validarEnlace(token: string, signal?: AbortSignal): Promise<boolean> {
  return (await consultarEnlace(token, signal)) !== null
}

/** POST /auth/restablecer-contrasena → 200 | 410 enlace inválido. Sirve para RESTABLECIMIENTO y ACTIVACION. */
export function restablecerContrasena(datos: RestablecerContrasenaRequest, signal?: AbortSignal) {
  return solicitar<MensajeResponse>({
    method: 'POST',
    url: '/auth/restablecer-contrasena',
    data: datos,
    publica: true,
    signal,
  })
}
