export type EstadoOperativo = 'DISPONIBLE' | 'EN_TRANSITO' | 'EN_TALLER' | 'FUERA_DE_SERVICIO'

export const ESTADOS_OPERATIVOS: EstadoOperativo[] = ['DISPONIBLE', 'EN_TRANSITO', 'EN_TALLER', 'FUERA_DE_SERVICIO']

/** EN_TRANSITO solo lo cambian la salida y la llegada de un viaje (409 TRANSICION_INVALIDA si se elige). */
export const ESTADOS_OPERATIVOS_ELEGIBLES: EstadoOperativo[] = ['DISPONIBLE', 'EN_TALLER', 'FUERA_DE_SERVICIO']

export const ETIQUETAS_ESTADO_OPERATIVO: Record<EstadoOperativo, string> = {
  DISPONIBLE: 'Disponible',
  EN_TRANSITO: 'En tránsito',
  EN_TALLER: 'En taller',
  FUERA_DE_SERVICIO: 'Fuera de servicio',
}

/** `BusResponse`. */
export interface Bus {
  id: string
  idSucursal: string
  placa: string
  marca: string
  modelo: string
  anioFabricacion: number
  capacidadPasajeros: number
  estadoOperativo: EstadoOperativo
  kilometrajeActual: number
  /** Ruta privada relativa al servicio (`/buses/{id}/foto?v=…`); se descarga con token. `null` sin foto. */
  fotoUrl: string | null
  activo: boolean
  version: number | null
  creadoEn: string
  actualizadoEn: string
}

/** `CrearBusRequest`: nace DISPONIBLE en la sucursal del administrador. */
export interface CrearBusRequest {
  placa: string
  marca: string
  modelo: string
  anioFabricacion: number
  capacidadPasajeros: number
  /** Opcional; por omisión 0. */
  kilometrajeActual?: number | null
}

/** `ActualizarBusRequest`. Ni estado ni kilometraje: tienen sus propios endpoints o vienen de Viajes. */
export interface ActualizarBusRequest {
  placa: string
  marca: string
  modelo: string
  anioFabricacion: number
  capacidadPasajeros: number
  /** Versión leída; si ya cambió el backend responde 409. */
  version?: number | null
}

/** `CambiarActivoRequest` (buses y choferes). */
export interface CambiarActivoRequest {
  activo: boolean
  version?: number | null
}

/** `CambiarEstadoOperativoRequest`. */
export interface CambiarEstadoOperativoRequest {
  estadoOperativo: EstadoOperativo
  version?: number | null
}

/** Cantidad de eventos guardados en el outbox por la republicación. */
export interface RepublicacionFlotaResponse {
  buses: number
  choferes: number
}
