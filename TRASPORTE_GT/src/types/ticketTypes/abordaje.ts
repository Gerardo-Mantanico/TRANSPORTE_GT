import type { EstadoViaje } from '../tripTypes/viaje'
import type { Canal } from './compra'

/** `PasajeroResponse`: un boleto confirmado del viaje. */
export interface Pasajero {
  numeroAsiento: number
  codigo: string
  idCompra: string
  canal: Canal
  nombreComprador: string
  nitComprador: string
  /** null mientras no aborde. */
  abordadoEn: string | null
}

/** `PasajerosViajeResponse`: lista de pasajeros para el abordaje. */
export interface PasajerosViaje {
  idViaje: string
  nombreOrigen: string
  nombreDestino: string
  fechaHoraSalida: string
  placaBus: string | null
  estado: EstadoViaje
  boletos: number
  abordados: number
  pasajeros: Pasajero[]
}

/** `AbordajeResponse`. */
export interface Abordaje {
  codigo: string
  idViaje: string
  numeroAsiento: number
  nombreComprador: string
  abordadoEn: string
}

/** Resultado de `POST /boletos/viajes/{id}/abordajes`: `nuevo = false` si el pasajero ya había abordado (200). */
export interface ResultadoAbordaje {
  abordaje: Abordaje
  nuevo: boolean
}
