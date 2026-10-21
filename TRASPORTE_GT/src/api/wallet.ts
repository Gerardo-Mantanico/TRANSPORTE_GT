import { api } from './client'
import type { CarteraResponse, ClienteResponse, MovimientoResponse, PaginaResponse } from './types'

export async function obtenerCartera(): Promise<CarteraResponse> {
  const { data } = await api.get<CarteraResponse>('/v1/customers/cartera/yo')
  return data
}

export async function recargarCartera(monto: number, fechaRecarga: string): Promise<MovimientoResponse> {
  const { data } = await api.post<MovimientoResponse>(
    '/v1/customers/cartera/recargas',
    { monto, fechaRecarga },
    { headers: { 'Clave-Idempotencia': crypto.randomUUID() } },
  )
  return data
}

export async function listarMovimientos(params?: {
  tipo?: 'RECARGA' | 'PAGO' | 'REEMBOLSO'
  desde?: string
  hasta?: string
  pagina?: number
  tamano?: number
}): Promise<PaginaResponse<MovimientoResponse>> {
  const { data } = await api.get<PaginaResponse<MovimientoResponse>>('/v1/customers/cartera/yo/movimientos', {
    params,
  })
  return data
}

export async function obtenerClienteYo(): Promise<ClienteResponse | null> {
  try {
    const { data } = await api.get<ClienteResponse>('/v1/customers/clientes/yo')
    return data
  } catch {
    return null
  }
}

export async function actualizarClienteYo(payload: {
  nit?: string | null
  dpi?: string | null
  telefono?: string | null
  direccion?: string | null
}): Promise<ClienteResponse> {
  const { data } = await api.put<ClienteResponse>('/v1/customers/clientes/yo', payload)
  return data
}
