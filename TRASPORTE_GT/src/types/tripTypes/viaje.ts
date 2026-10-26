export type TipoViaje = 'REGULAR' | 'ALQUILER_PRIVADO'

export const ETIQUETAS_TIPO_VIAJE: Record<TipoViaje, string> = {
  REGULAR: 'Regular',
  ALQUILER_PRIVADO: 'Alquiler privado',
}

export type EstadoViaje = 'PROGRAMADO' | 'EN_TRANSITO' | 'FINALIZADO' | 'PENDIENTE_ASIGNACION'

export const ESTADOS_VIAJE: EstadoViaje[] = ['PENDIENTE_ASIGNACION', 'PROGRAMADO', 'EN_TRANSITO', 'FINALIZADO']

export const ETIQUETAS_ESTADO_VIAJE: Record<EstadoViaje, string> = {
  PENDIENTE_ASIGNACION: 'Pendiente de asignación',
  PROGRAMADO: 'Programado',
  EN_TRANSITO: 'En tránsito',
  FINALIZADO: 'Finalizado',
}

/**
 * `ViajeResumenResponse` de `GET /viajes/resumen`: datos públicos de un viaje (sin chofer ni registros).
 * Los viajes eliminados no aparecen.
 */
export interface ViajeResumen {
  id: string
  tipoViaje: TipoViaje
  estado: EstadoViaje
  idRuta: string | null
  idSucursalOrigen: string
  nombreOrigen: string
  nombreDestino: string
  fechaHoraSalida: string
  fechaHoraLlegadaEstimada: string
  precioBoleto: number | null
  placaBus: string | null
}

/** Máximo de ids por consulta de resumen (igual que en TripService). */
export const MAX_IDS_RESUMEN = 100

/** `BusResumen` dentro de un viaje. */
export interface BusDeViaje {
  idBus: string
  placa: string
  capacidad: number
  estadoOperativo: string
  activo: boolean
}

/** `ChoferResumen` dentro de un viaje. */
export interface ChoferDeViaje {
  idChofer: string
  nombreCompleto: string
  /** Llega como medianoche UTC: usar solo la fecha (`slice(0, 10)`). */
  fechaVencimientoLicencia: string | null
  salarioBaseViaje: number
  activo: boolean
}

/** Registro inmutable de salida. */
export interface RegistroSalida {
  id: string
  fechaHoraSalidaReal: string
  kilometrajeInicial: number
  registradoPor: string
}

/** Registro inmutable de llegada. */
export interface RegistroLlegada {
  id: string
  fechaHoraLlegadaReal: string
  kilometrajeFinal: number
  distanciaRecorridaKm: number
  gastoCombustibleTotal: number
  salarioBaseChofer: number
  registradoPor: string
}

/** `ViajeResponse`. */
export interface Viaje {
  id: string
  tipoViaje: TipoViaje
  estado: EstadoViaje
  idRuta: string | null
  idSucursalOrigen: string
  nombreOrigen: string
  nombreDestino: string
  idAlquiler: string | null
  fechaHoraSalida: string
  fechaHoraLlegadaEstimada: string
  precioBoleto: number | null
  /** Solo alquileres: pasajeros que debe cubrir el bus. */
  numeroPasajeros: number | null
  bus: BusDeViaje | null
  chofer: ChoferDeViaje | null
  registroSalida: RegistroSalida | null
  registroLlegada: RegistroLlegada | null
  version: number | null
}

/** `ViajeRegularRequest`: los viajes de alquiler no se crean por API (nacen con AlquilerConfirmado). */
export interface ViajeRegularRequest {
  idRuta: string
  idBus: string
  idChofer: string
  /** ISO con zona, p. ej. `2026-10-25T06:00:00-06:00`. */
  fechaHoraSalida: string
  fechaHoraLlegadaEstimada: string
}

/** `ViajeUpdateRequest`: bus, chofer o fechas (no el tipo ni la ruta); los campos omitidos no cambian. */
export interface ViajeUpdateRequest {
  idBus?: string
  idChofer?: string
  fechaHoraSalida?: string
  fechaHoraLlegadaEstimada?: string
}

/** `AsignacionRequest`: bus y chofer de un alquiler PENDIENTE_ASIGNACION. */
export interface AsignacionRequest {
  idBus: string
  idChofer: string
}

/** `SalidaRequest` (registro inmutable). */
export interface SalidaRequest {
  fechaHoraSalidaReal: string
  kilometrajeInicial: number
}

/** `LlegadaRequest` (registro inmutable). */
export interface LlegadaRequest {
  fechaHoraLlegadaReal: string
  kilometrajeFinal: number
  gastoCombustibleTotal: number
}

/** Cantidad de eventos guardados en el outbox por la republicación. */
export interface RepublicacionViajesResponse {
  rutas: number
  viajes: number
}
