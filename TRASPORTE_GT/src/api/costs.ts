import { api } from './client'
import type { CategoriaResponse, GastoTallerResponse, PaginaResponse, TarifaDepreciacionResponse } from './types'

export async function listarCategorias(params?: { activa?: boolean }): Promise<CategoriaResponse[]> {
  const { data } = await api.get<CategoriaResponse[]>('/v1/costs/costos/categorias', { params })
  return data
}

export async function crearCategoria(payload: {
  nombre: string
  descripcion?: string | null
}): Promise<CategoriaResponse> {
  const { data } = await api.post<CategoriaResponse>('/v1/costs/costos/categorias', payload)
  return data
}

export async function desactivarCategoria(id: string, activa: boolean): Promise<CategoriaResponse> {
  const { data } = await api.patch<CategoriaResponse>(`/v1/costs/costos/categorias/${id}/activa`, { activa })
  return data
}

export async function listarGastosTaller(params?: {
  idBus?: string
  desde?: string
  hasta?: string
  pagina?: number
  tamano?: number
}): Promise<PaginaResponse<GastoTallerResponse>> {
  const { data } = await api.get<PaginaResponse<GastoTallerResponse>>('/v1/costs/costos/taller', { params })
  return data
}

export async function registrarGastoTaller(payload: {
  idBus: string
  fechaServicio: string
  observaciones?: string | null
  lineas: Array<{
    idCategoria: string
    descripcion: string
    tipo: 'MANO_DE_OBRA' | 'REPUESTO'
    monto: number
  }>
}): Promise<GastoTallerResponse> {
  const { data } = await api.post<GastoTallerResponse>('/v1/costs/costos/taller', payload)
  return data
}

export async function obtenerTarifaDepreciacion(
  fecha?: string,
): Promise<TarifaDepreciacionResponse | null> {
  try {
    const { data } = await api.get<TarifaDepreciacionResponse>(
      '/v1/costs/costos/depreciacion/tarifa-vigente',
      { params: fecha ? { fecha } : undefined },
    )
    return data
  } catch {
    return null
  }
}

export async function crearTarifaDepreciacion(payload: {
  montoPorKm: number
  vigenteDesde: string
}): Promise<TarifaDepreciacionResponse> {
  const { data } = await api.post<TarifaDepreciacionResponse>('/v1/costs/costos/depreciacion/tarifas', payload)
  return data
}
