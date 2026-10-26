export type TipoLineaTaller = 'MANO_DE_OBRA' | 'REPUESTO'

export const ETIQUETAS_TIPO_LINEA: Record<TipoLineaTaller, string> = {
  MANO_DE_OBRA: 'Mano de obra',
  REPUESTO: 'Repuesto',
}

/** Línea de un gasto de taller; la categoría es obligatoria. */
export interface LineaTaller {
  id: string
  idCategoria: string
  nombreCategoria: string
  descripcion: string
  tipo: TipoLineaTaller
  monto: number
}

/** `GastoTallerResponse`: inmutable; el total lo calcula el backend. */
export interface GastoTaller {
  id: string
  idBus: string
  idSucursal: string
  /** `YYYY-MM-DD` */
  fechaServicio: string
  total: number
  observaciones: string | null
  registradoPor: string
  creadoEn: string
  lineas: LineaTaller[]
}

export interface LineaTallerRequest {
  idCategoria: string
  descripcion: string
  tipo: TipoLineaTaller
  monto: number
}

/** `GastoTallerRequest`. `fechaServicio` no puede ser futura. */
export interface GastoTallerRequest {
  idBus: string
  fechaServicio: string
  observaciones?: string | null
  lineas: LineaTallerRequest[]
}
