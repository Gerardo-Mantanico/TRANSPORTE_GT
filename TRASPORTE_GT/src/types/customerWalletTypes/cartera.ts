export const TIPOS_MOVIMIENTO = ['RECARGA', 'PAGO', 'REEMBOLSO'] as const

export type TipoMovimiento = (typeof TIPOS_MOVIMIENTO)[number]

export const ETIQUETAS_TIPO_MOVIMIENTO: Record<TipoMovimiento, string> = {
  RECARGA: 'Recarga',
  PAGO: 'Pago',
  REEMBOLSO: 'Reembolso',
}

export type TipoReferencia = 'BOLETOS' | 'ALQUILER'

/** `CarteraResponse`. */
export interface Cartera {
  idCartera: string
  /** Monto en quetzales como texto, p. ej. `"1250.00"`. */
  saldo: string
  actualizadoEn: string
}

/** `MovimientoResponse`: una línea del libro de la cartera. */
export interface Movimiento {
  idMovimiento: string
  tipo: TipoMovimiento
  monto: string
  saldoPosterior: string
  /** Solo PAGO y REEMBOLSO llevan referencia. */
  tipoReferencia: TipoReferencia | null
  idReferencia: string | null
  /** Fecha de negocio `YYYY-MM-DD`. */
  fechaMovimiento: string
  descripcion: string | null
  creadoEn: string
}

/** `RecargaRequest`. */
export interface RecargaRequest {
  /** Con 2 decimales como texto para no perder precisión, p. ej. `"200.00"`. */
  monto: string
  /** `YYYY-MM-DD` (valor inicial: hoy). */
  fechaRecarga: string
}

/**
 * Contrato interno de `POST /cartera/pagos` (lo llaman Boletos y Alquileres, no el navegador).
 * Se deja tipado como referencia.
 */
export interface PagoRequest {
  tipoReferencia: TipoReferencia
  idReferencia: string
  monto: string
  fechaPago: string
  descripcion?: string | null
}

export interface PagoResponse {
  idPago: string
  saldoPosterior: string
}

export interface PagoConsultaResponse {
  idPago: string
  monto: string
  fechaPago: string
}
