import { api } from './client'
import type { RutaResponse, ViajeResponse } from './types'

export async function listarRutas(params?: {
  idSucursalOrigen?: string
  idSucursalDestino?: string
}): Promise<RutaResponse[]> {
  const { data } = await api.get<RutaResponse[]>('/v1/trips/rutas', { params })
  return data
}

export async function crearRuta(payload: {
  idSucursalOrigen: string
  idSucursalDestino: string
  distanciaKm: number
  precioBoleto: number
}): Promise<RutaResponse> {
  const { data } = await api.post<RutaResponse>('/v1/trips/rutas', payload)
  return data
}

export async function actualizarRuta(
  id: string,
  payload: {
    idSucursalOrigen: string
    idSucursalDestino: string
    distanciaKm: number
    precioBoleto: number
  },
): Promise<RutaResponse> {
  const { data } = await api.put<RutaResponse>(`/v1/trips/rutas/${id}`, payload)
  return data
}

export async function eliminarRuta(id: string): Promise<void> {
  await api.delete(`/v1/trips/rutas/${id}`)
}

export async function listarViajes(params?: {
  tipoViaje?: 'REGULAR' | 'ALQUILER_PRIVADO'
  estado?: 'PROGRAMADO' | 'PENDIENTE_ASIGNACION' | 'EN_TRANSITO' | 'FINALIZADO'
  idRuta?: string
  idSucursal?: string
  desde?: string
  hasta?: string
  sinAsignar?: boolean
}): Promise<ViajeResponse[]> {
  const { data } = await api.get<ViajeResponse[]>('/v1/trips/viajes', { params })
  return data
}

export async function crearViaje(payload: {
  idRuta: string
  idBus: string
  idChofer: string
  fechaHoraSalida: string
  fechaHoraLlegadaEstimada: string
}): Promise<ViajeResponse> {
  const { data } = await api.post<ViajeResponse>('/v1/trips/viajes', payload)
  return data
}

export async function registrarSalidaViaje(
  id: string,
  payload: { fechaHoraSalidaReal: string; kilometrajeInicial: number },
): Promise<ViajeResponse> {
  const { data } = await api.post<ViajeResponse>(`/v1/trips/viajes/${id}/salida`, payload)
  return data
}

export async function registrarLlegadaViaje(
  id: string,
  payload: { fechaHoraLlegadaReal: string; kilometrajeFinal: number; gastoCombustibleTotal: number },
): Promise<ViajeResponse> {
  const { data } = await api.post<ViajeResponse>(`/v1/trips/viajes/${id}/llegada`, payload)
  return data
}

export async function eliminarViaje(id: string): Promise<void> {
  await api.delete(`/v1/trips/viajes/${id}`)
}
