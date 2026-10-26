/** `TarifaResponse`: precio por km y por día del precio estimado. */
export interface Tarifa {
  id: string
  precioPorKm: number
  precioPorDia: number
  /** `YYYY-MM-DD` */
  vigenteDesde: string
  creadoPor: string
  creadoEn: string
}

/** `TarifaRequest`: una segunda tarifa con la misma `vigenteDesde` reemplaza a la anterior. */
export interface TarifaRequest {
  precioPorKm: number
  precioPorDia: number
  /** `YYYY-MM-DD`, hoy o después. */
  vigenteDesde: string
}

/** Factor de carretera del backend (`alquileres.factor-carretera`) para el estimado previo en pantalla. */
export const FACTOR_CARRETERA = 1.3
