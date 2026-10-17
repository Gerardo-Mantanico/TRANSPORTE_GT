import type { Usuario } from './usuario'

/** `SucursalResponse` del IdentityService. */
export interface Sucursal {
  id: string
  nombre: string
  departamento: string
  direccion: string
  telefono: string | null
  latitud: number
  longitud: number
  activa: boolean
  version: number | null
  creadoEn: string
  actualizadoEn: string
}

/** `SucursalRequest`: datos editables de una sucursal. */
export interface DatosSucursal {
  nombre: string
  departamento: string
  direccion: string
  telefono?: string | null
  latitud: number
  longitud: number
}

export interface NuevoAdministradorRequest {
  nombreCompleto: string
  correo: string
}

export interface CrearSucursalRequest {
  sucursal: DatosSucursal
  administrador: NuevoAdministradorRequest
}

export interface ActualizarSucursalRequest {
  sucursal: DatosSucursal
  /** Versión leída; si ya cambió el backend responde 409. */
  version?: number | null
}

export interface SucursalCreada {
  sucursal: Sucursal
  administrador: Usuario
}
