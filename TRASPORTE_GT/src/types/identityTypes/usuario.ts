import type { Rol } from './rol'

/** `UsuarioResponse` del IdentityService. */
export interface Usuario {
  id: string
  correo: string
  nombreCompleto: string
  rol: Rol
  idSucursal: string | null
  nombreSucursal: string | null
  activo: boolean
  activacionPendiente: boolean
  version: number | null
  creadoEn: string
}

/** `UsuarioSesionResponse`: datos que devuelve el login (los mismos del JWT). */
export interface UsuarioSesion {
  id: string
  correo: string
  nombreCompleto: string
  rol: Rol
  idSucursal: string | null
}

export interface CrearUsuarioRequest {
  nombreCompleto: string
  correo: string
  rol: Rol
  /** Obligatoria para ADMIN_SUCURSAL; nula para ADMIN_SISTEMA. */
  idSucursal?: string | null
}

export interface ActualizarUsuarioRequest {
  nombreCompleto: string
  correo: string
  /** Versión leída; si ya cambió el backend responde 409. */
  version?: number | null
}

export interface ActualizarPerfilRequest {
  nombreCompleto: string
}
