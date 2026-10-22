export const TIPOS_LICENCIA = ['A', 'B', 'C', 'M', 'E'] as const

export type TipoLicencia = (typeof TIPOS_LICENCIA)[number]

/** `ChoferResponse`. */
export interface Chofer {
  id: string
  /** Usuario de Identidad con rol CHOFER, si tiene acceso al sistema. */
  idUsuario: string | null
  idSucursal: string
  nombreCompleto: string
  correo: string
  telefono: string
  numeroLicencia: string
  tipoLicencia: TipoLicencia
  /** `YYYY-MM-DD` */
  fechaVencimientoLicencia: string
  salarioBaseViaje: number
  /** Ruta privada relativa al servicio (`/choferes/{id}/foto?v=…`); se descarga con token. `null` sin foto. */
  fotoUrl: string | null
  activo: boolean
  version: number | null
  creadoEn: string
  actualizadoEn: string
}

/** `CrearChoferRequest`: se crea en la sucursal del administrador. */
export interface CrearChoferRequest {
  nombreCompleto: string
  correo: string
  telefono: string
  numeroLicencia: string
  tipoLicencia: TipoLicencia
  fechaVencimientoLicencia: string
  salarioBaseViaje: number
  idUsuario?: string | null
}

/** `ActualizarChoferRequest`. */
export interface ActualizarChoferRequest extends CrearChoferRequest {
  /** Versión leída; si ya cambió el backend responde 409. */
  version?: number | null
}

/** Mismo patrón que el backend para el teléfono. */
export const PATRON_TELEFONO_CHOFER = /^[0-9+\- ]*$/
