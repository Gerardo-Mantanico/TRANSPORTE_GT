import { clienteCostos, limpiarParametros, solicitar } from '../../api/clienteHttp'
import type { Categoria, CategoriaRequest, FiltroCategorias } from '../../types/costsTypes'

/** GET /costos/categorias?activa → 200. SIS y SUC. */
export function listarCategorias(filtro: FiltroCategorias = {}, signal?: AbortSignal) {
  return solicitar<Categoria[]>(
    { method: 'GET', url: '/costos/categorias', params: limpiarParametros(filtro), signal },
    clienteCostos,
  )
}

/** POST /costos/categorias → 201 | 409 nombre duplicado. */
export function crearCategoria(datos: CategoriaRequest, signal?: AbortSignal) {
  return solicitar<Categoria>({ method: 'POST', url: '/costos/categorias', data: datos, signal }, clienteCostos)
}

/** PUT /costos/categorias/{id} → 200 (nombre y descripción). */
export function actualizarCategoria(id: string, datos: CategoriaRequest, signal?: AbortSignal) {
  return solicitar<Categoria>({ method: 'PUT', url: `/costos/categorias/${id}`, data: datos, signal }, clienteCostos)
}

/** PATCH /costos/categorias/{id}/activa → 200. */
export function cambiarActivaCategoria(id: string, activa: boolean, signal?: AbortSignal) {
  return solicitar<Categoria>(
    { method: 'PATCH', url: `/costos/categorias/${id}/activa`, data: { activa }, signal },
    clienteCostos,
  )
}

/** DELETE /costos/categorias/{id} → 204 | 409 CATEGORIA_CON_GASTOS (usar desactivar). */
export function eliminarCategoria(id: string, signal?: AbortSignal) {
  return solicitar<void>({ method: 'DELETE', url: `/costos/categorias/${id}`, signal }, clienteCostos)
}
