import type { Pagina } from '../types/pagina'

interface PaginaSpringClasica<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

interface PaginaSpringModelo<T> {
  content: T[]
  page: { size: number; number: number; totalElements: number; totalPages: number }
}

export type PaginaCruda<T> = Pagina<T> | PaginaSpringClasica<T> | PaginaSpringModelo<T> | T[]

/**
 * Acepta las formas de paginación que pueden llegar del backend:
 * `PaginaResponse` (`contenido`/`totalElementos`), `Page` de Spring (`content`/`totalElements`)
 * o `PagedModel` de Spring 3.3+ (`content` + `page{...}`).
 */
export function normalizarPagina<T>(cruda: PaginaCruda<T>): Pagina<T> {
  if (Array.isArray(cruda)) {
    return { contenido: cruda, pagina: 0, tamano: cruda.length, totalElementos: cruda.length, totalPaginas: 1 }
  }
  if ('contenido' in cruda) return cruda
  if ('page' in cruda && cruda.page) {
    return {
      contenido: cruda.content,
      pagina: cruda.page.number,
      tamano: cruda.page.size,
      totalElementos: cruda.page.totalElements,
      totalPaginas: cruda.page.totalPages,
    }
  }
  const clasica = cruda as PaginaSpringClasica<T>
  return {
    contenido: clasica.content ?? [],
    pagina: clasica.number ?? 0,
    tamano: clasica.size ?? clasica.content?.length ?? 0,
    totalElementos: clasica.totalElements ?? clasica.content?.length ?? 0,
    totalPaginas: clasica.totalPages ?? 1,
  }
}
