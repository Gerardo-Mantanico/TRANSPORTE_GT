import type { UsuarioSesion } from './usuario'

export interface LoginRequest {
  correo: string
  contrasena: string
}

export interface LoginResponse {
  token: string
  expiraEn: string
  usuario: UsuarioSesion
}

export interface RegistroRequest {
  nombreCompleto: string
  correo: string
  contrasena: string
}

export interface CambiarContrasenaRequest {
  contrasenaActual: string
  nuevaContrasena: string
}

export interface OlvideContrasenaRequest {
  correo: string
}

export interface RestablecerContrasenaRequest {
  token: string
  nuevaContrasena: string
}

export type PropositoContrasena = 'RESTABLECIMIENTO' | 'ACTIVACION'

/** `EnlaceContrasenaResponse`: respuesta de validar un enlace vigente. */
export interface EnlaceContrasena {
  proposito: PropositoContrasena
  /** p. ej. `a***z@transportes.gt` */
  correoEnmascarado: string
}

export interface MensajeResponse {
  mensaje: string
}

/** Cantidad de eventos guardados en el outbox por la republicación. */
export interface RepublicacionResponse {
  sucursales: number
  usuarios: number
}

/** Misma política que `PoliticaContrasena` del backend. */
export const POLITICA_CONTRASENA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/

export const MENSAJE_POLITICA_CONTRASENA =
  'Debe tener entre 8 y 72 caracteres e incluir al menos una mayúscula, una minúscula y un número.'
