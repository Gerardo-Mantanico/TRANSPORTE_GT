/** Valor de un subtotal o total: el dinero llega como texto con 2 decimales y los conteos como número. */
export type ValorTotal = string | number

export interface FiltrosAplicados {
  desde: string | null
  hasta: string | null
  /** Filtros adicionales con su valor legible (`sucursal`, `bus`, `ruta`, `estado`). */
  otros: Record<string, string>
}

/** Un grupo del reporte (sucursal, categoría o bus). Trae filas o subgrupos, nunca ambos. */
export interface GrupoReporte<F> {
  clave?: string | null
  titulo?: string | null
  filas?: F[]
  subgrupos?: GrupoReporte<F>[]
  subtotales?: Record<string, ValorTotal> | null
}

/** Respuesta común de todos los reportes (`formato=json`); el PDF usa los mismos datos. */
export interface ReporteTabla<F> {
  titulo: string
  filtros: FiltrosAplicados
  generadoEn: string
  grupos: GrupoReporte<F>[]
  totales: Record<string, ValorTotal>
}

/** Intervalo de fechas de negocio (inclusivo). Sin fechas = todos los registros. */
export interface FiltroFechas {
  desde?: string
  hasta?: string
}

export interface OpcionCatalogo {
  id: string
  nombre: string
  /** `false` en rutas eliminadas o buses inactivos. */
  activo: boolean
}
