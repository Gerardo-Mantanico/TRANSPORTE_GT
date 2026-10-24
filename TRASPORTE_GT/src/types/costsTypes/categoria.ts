/** `CategoriaResponse`: catálogo dinámico para clasificar las líneas de los gastos de taller. */
export interface Categoria {
  id: string
  nombre: string
  descripcion: string | null
  activa: boolean
  creadoEn: string
}

/** `CategoriaRequest` (crear y editar): sin cambiar código. */
export interface CategoriaRequest {
  nombre: string
  descripcion?: string | null
}
