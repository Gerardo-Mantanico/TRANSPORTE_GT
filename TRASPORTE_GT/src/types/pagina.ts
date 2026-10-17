/** Página normalizada, común a todos los microservicios. */
export interface Pagina<T> {
  contenido: T[]
  pagina: number
  tamano: number
  totalElementos: number
  totalPaginas: number
}

/** Parámetros de paginación de Spring (`page`, `size`, `sort`). */
export interface ParametrosPagina {
  page?: number
  size?: number
  sort?: string
}
