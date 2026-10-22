export type TipoViaje = 'REGULAR' | 'ALQUILER_PRIVADO'

export type EstadoViaje = 'PROGRAMADO' | 'EN_TRANSITO' | 'FINALIZADO' | 'PENDIENTE_ASIGNACION'

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
