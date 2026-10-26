export type EstadoCompra = 'RESERVADA' | 'CONFIRMADA' | 'ANULADA'

export const ESTADOS_COMPRA: EstadoCompra[] = ['RESERVADA', 'CONFIRMADA', 'ANULADA']

export const ETIQUETAS_ESTADO_COMPRA: Record<EstadoCompra, string> = {
  RESERVADA: 'Reservada',
  CONFIRMADA: 'Confirmada',
  ANULADA: 'Anulada',
}

export type EstadoBoleto = 'RESERVADO' | 'CONFIRMADO' | 'ANULADO'

export type Canal = 'EN_LINEA' | 'MOSTRADOR'

export const ETIQUETAS_CANAL: Record<Canal, string> = {
  EN_LINEA: 'En línea',
  MOSTRADOR: 'Presencial',
}

/** `BoletoResponse`. */
export interface Boleto {
  numeroAsiento: number
  codigo: string
  estado: EstadoBoleto
}

/** `CompraResponse`: una compra con sus boletos. */
export interface Compra {
  idCompra: string
  idViaje: string
  canal: Canal
  estado: EstadoCompra
  asientos: Boleto[]
  precioUnitario: string
  montoTotal: string
  nitComprador: string | null
  nombreComprador: string | null
  idPago: string | null
  fechaPago: string
  /** Solo en RESERVADA: hora en que se libera si el pago no se confirma. */
  reservaExpiraEn: string | null
  motivoAnulacion: string | null
  creadoEn: string
  confirmadoEn: string | null
}

/** `CompraRequest`: `idCompra` lo genera el frontend y es la clave de idempotencia. */
export interface CompraRequest {
  idCompra: string
  idViaje: string
  asientos: number[]
  /** `YYYY-MM-DD` */
  fechaPago: string
}

/** `VentaMostradorRequest`: sin NIT se registra como consumidor final (CF). */
export interface VentaMostradorRequest {
  idCompra: string
  idViaje: string
  asientos: number[]
  nitComprador?: string | null
  nombreComprador?: string | null
  /** `YYYY-MM-DD` */
  fechaPago: string
}

/**
 * Cómo terminó `POST /boletos/compras`: 201 `CONFIRMADA`, 200 `EXISTENTE` (idCompra repetido ya confirmado)
 * o 202 `PENDIENTE` (Cartera no respondió: la compra sigue RESERVADA y el job la resuelve).
 */
export type ResultadoCompra = 'CONFIRMADA' | 'EXISTENTE' | 'PENDIENTE'

export interface CompraEnLinea {
  compra: Compra
  resultado: ResultadoCompra
}

/** Máximo de asientos por compra (`boletos.compra.max-asientos`). */
export const MAX_ASIENTOS_POR_COMPRA = 10
