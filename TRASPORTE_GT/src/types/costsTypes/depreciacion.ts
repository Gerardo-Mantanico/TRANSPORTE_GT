/** `TarifaDepreciacionResponse`: monto por km aplicado a los cierres de viaje desde `vigenteDesde`. */
export interface TarifaDepreciacion {
  id: string
  montoPorKm: number
  /** `YYYY-MM-DD` */
  vigenteDesde: string
  creadoPor: string
  creadoEn: string
}

/** `TarifaDepreciacionRequest`. El backend no acepta una vigencia futura; la misma fecha reemplaza a la anterior. */
export interface TarifaDepreciacionRequest {
  montoPorKm: number
  vigenteDesde: string
}

/** `ResumenCostosViajeResponse`: lo genera Costos al consumir LlegadaRegistrada (sin POST). */
export interface ResumenCostosViaje {
  idViaje: string
  combustible: { idGasto: string; monto: number; fechaGasto: string } | null
  depreciacion: { idDepreciacion: string; distanciaKm: number; montoPorKm: number; monto: number } | null
  pagoChofer: {
    idPago: string
    idChofer: string
    salarioBase: number
    multiplicador: number
    monto: number
  } | null
}
