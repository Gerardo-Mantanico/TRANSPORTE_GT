/** Filtros de `GET /costos/categorias`. */
export interface FiltroCategorias {
  activa?: boolean
}

/** Filtros de `GET /costos/taller`. Días `YYYY-MM-DD`; pagina con `pagina`/`tamano`. */
export interface FiltroTaller {
  idBus?: string
  desde?: string
  hasta?: string
  pagina?: number
  tamano?: number
}
