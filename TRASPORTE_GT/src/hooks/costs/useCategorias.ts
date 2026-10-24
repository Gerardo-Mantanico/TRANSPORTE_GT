import { useConsulta } from '../useConsulta'
import { useMutacion } from '../useMutacion'
import {
  actualizarCategoria,
  cambiarActivaCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
} from '../../services/costs'
import type { CategoriaRequest, FiltroCategorias } from '../../types/costsTypes'

export function useCategorias(filtro: FiltroCategorias = {}) {
  return useConsulta((signal) => listarCategorias(filtro, signal), JSON.stringify(filtro))
}

const crear = (datos: CategoriaRequest, signal: AbortSignal) => crearCategoria(datos, signal)
const editar = ({ id, ...datos }: CategoriaRequest & { id: string }, signal: AbortSignal) =>
  actualizarCategoria(id, datos, signal)
const cambiarActiva = ({ id, activa }: { id: string; activa: boolean }, signal: AbortSignal) =>
  cambiarActivaCategoria(id, activa, signal)
const eliminar = (id: string, signal: AbortSignal) => eliminarCategoria(id, signal)

export function useCrearCategoria() {
  return useMutacion(crear)
}

export function useEditarCategoria() {
  return useMutacion(editar)
}

export function useCambiarActivaCategoria() {
  return useMutacion(cambiarActiva)
}

/** 409 CATEGORIA_CON_GASTOS: la categoría ya se usó; se desactiva en lugar de eliminarla. */
export function useEliminarCategoria() {
  return useMutacion(eliminar)
}
