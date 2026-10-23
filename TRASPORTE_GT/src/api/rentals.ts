import { api } from './client'
import type { AlquilerResponse, PaginaResponse, SolicitudAlquilerRequest } from './types'

export async function listarAlquileres(params?: {
  estado?: string
  desde?: string
  hasta?: string
  sinAsignar?: boolean
  pagina?: number
  tamano?: number
}): Promise<PaginaResponse<AlquilerResponse>> {
  const { data } = await api.get<PaginaResponse<AlquilerResponse>>('/v1/rentals/alquileres', { params })
  return data
}

export async function listarMisAlquileres(params?: { pagina?: number; tamano?: number }): Promise<
  PaginaResponse<AlquilerResponse>
> {
  const { data } = await api.get<PaginaResponse<AlquilerResponse>>('/v1/rentals/alquileres/mios', { params })
  return data
}

export async function solicitarAlquiler(payload: SolicitudAlquilerRequest): Promise<AlquilerResponse> {
  const { data } = await api.post<AlquilerResponse>('/v1/rentals/alquileres/solicitudes', payload)
  return data
}

export async function cotizarAlquiler(
  id: string,
  payload: { precioFinal: number; fechaHoraLlegadaEstimada: string; comentario?: string },
): Promise<AlquilerResponse> {
  const { data } = await api.post<AlquilerResponse>(`/v1/rentals/alquileres/${id}/cotizacion`, payload)
  return data
}

export async function pagarAlquiler(id: string, fechaPago: string): Promise<AlquilerResponse> {
  const { data } = await api.post<AlquilerResponse>(`/v1/rentals/alquileres/${id}/pago`, { fechaPago })
  return data
}

export async function pagarAlquilerMostrador(id: string, fechaPago: string): Promise<AlquilerResponse> {
  const { data } = await api.post<AlquilerResponse>(`/v1/rentals/alquileres/${id}/pago-mostrador`, { fechaPago })
  return data
}
