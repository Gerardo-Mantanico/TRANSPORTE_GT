import { api } from './client'
import type { BusResponse, ChoferResponse, EstadoOperativo, PaginaResponse, TipoLicencia } from './types'

export async function listarBuses(params?: {
  idSucursal?: string
  estadoOperativo?: EstadoOperativo
  activo?: boolean
  texto?: string
  page?: number
  size?: number
}): Promise<PaginaResponse<BusResponse>> {
  const { data } = await api.get<PaginaResponse<BusResponse>>('/v1/fleet/buses', { params })
  return data
}

export async function crearBus(payload: {
  placa: string
  marca: string
  modelo: string
  anioFabricacion: number
  capacidadPasajeros: number
  kilometrajeActual?: number
}): Promise<BusResponse> {
  const { data } = await api.post<BusResponse>('/v1/fleet/buses', payload)
  return data
}

export async function actualizarBus(
  id: string,
  payload: {
    placa: string
    marca: string
    modelo: string
    anioFabricacion: number
    capacidadPasajeros: number
    kilometrajeActual?: number
    version?: number
  },
): Promise<BusResponse> {
  const { data } = await api.put<BusResponse>(`/v1/fleet/buses/${id}`, payload)
  return data
}

export async function cambiarActivoBus(id: string, activo: boolean, version?: number): Promise<BusResponse> {
  const { data } = await api.patch<BusResponse>(`/v1/fleet/buses/${id}/activo`, { activo, version })
  return data
}

export async function subirFotoBus(id: string, file: File): Promise<BusResponse> {
  const form = new FormData()
  form.append('archivo', file)
  const { data } = await api.post<BusResponse>(`/v1/fleet/buses/${id}/foto`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function listarChoferes(params?: {
  idSucursal?: string
  activo?: boolean
  texto?: string
  page?: number
  size?: number
}): Promise<PaginaResponse<ChoferResponse>> {
  const { data } = await api.get<PaginaResponse<ChoferResponse>>('/v1/fleet/choferes', { params })
  return data
}

export async function crearChofer(payload: {
  nombreCompleto: string
  correo: string
  telefono: string
  numeroLicencia: string
  tipoLicencia: TipoLicencia
  fechaVencimientoLicencia: string
  salarioBaseViaje: number
  idSucursal: string
  idUsuario?: string | null
}): Promise<ChoferResponse> {
  const { data } = await api.post<ChoferResponse>('/v1/fleet/choferes', payload)
  return data
}

export async function actualizarChofer(
  id: string,
  payload: {
    nombreCompleto: string
    correo: string
    telefono: string
    numeroLicencia: string
    tipoLicencia: TipoLicencia
    fechaVencimientoLicencia: string
    salarioBaseViaje: number
    version?: number
  },
): Promise<ChoferResponse> {
  const { data } = await api.put<ChoferResponse>(`/v1/fleet/choferes/${id}`, payload)
  return data
}

export async function cambiarActivoChofer(id: string, activo: boolean, version?: number): Promise<ChoferResponse> {
  const { data } = await api.patch<ChoferResponse>(`/v1/fleet/choferes/${id}/activo`, { activo, version })
  return data
}

export async function subirFotoChofer(id: string, file: File): Promise<ChoferResponse> {
  const form = new FormData()
  form.append('archivo', file)
  const { data } = await api.post<ChoferResponse>(`/v1/fleet/choferes/${id}/foto`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
