import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import {
  cotizarAlquiler,
  listarAlquileres,
  listarMisAlquileres,
  obtenerAlquiler,
  pagarAlquilerEnLinea,
  pagarAlquilerMostrador,
  solicitarAlquiler,
  solicitarAlquilerMostrador,
} from '../../services/rentals'
import type {
  CotizacionRequest,
  FiltroAlquileres,
  FiltroMisAlquileres,
  PagoAlquilerRequest,
  SolicitudAlquilerRequest,
  SolicitudMostradorRequest,
} from '../../types/rentalTypes'

export function useMisAlquileres(filtro: FiltroMisAlquileres) {
  return useConsulta((signal) => listarMisAlquileres(filtro, signal), JSON.stringify(filtro))
}

export function useAlquileres(filtro: FiltroAlquileres) {
  return useConsulta((signal) => listarAlquileres(filtro, signal), JSON.stringify(filtro))
}

export function useAlquiler(id: string | null | undefined) {
  return useConsulta((signal) => obtenerAlquiler(id ?? '', signal), id ?? '', Boolean(id))
}

const solicitarEnLinea = (datos: SolicitudAlquilerRequest, signal: AbortSignal) => solicitarAlquiler(datos, signal)
const solicitarMostrador = (datos: SolicitudMostradorRequest, signal: AbortSignal) =>
  solicitarAlquilerMostrador(datos, signal)
const cotizar = ({ id, ...datos }: CotizacionRequest & { id: string }, signal: AbortSignal) =>
  cotizarAlquiler(id, datos, signal)
const pagarEnLinea = ({ id, ...datos }: PagoAlquilerRequest & { id: string }, signal: AbortSignal) =>
  pagarAlquilerEnLinea(id, datos, signal)
const pagarMostrador = ({ id, ...datos }: PagoAlquilerRequest & { id: string }, signal: AbortSignal) =>
  pagarAlquilerMostrador(id, datos, signal)

export function useSolicitarAlquiler() {
  return useMutacion(solicitarEnLinea)
}

export function useSolicitarAlquilerMostrador() {
  return useMutacion(solicitarMostrador)
}

export function useCotizarAlquiler() {
  return useMutacion(cotizar)
}

/** 503: Cartera no respondió y el alquiler sigue COTIZADO; reintentar es seguro (idempotente por alquiler). */
export function usePagarAlquilerEnLinea() {
  return useMutacion(pagarEnLinea)
}

export function usePagarAlquilerMostrador() {
  return useMutacion(pagarMostrador)
}
