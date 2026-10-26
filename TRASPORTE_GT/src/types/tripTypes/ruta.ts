/** `RutaResponse`. Los nombres de las sucursales salen de Identidad. */
export interface Ruta {
  id: string
  idSucursalOrigen: string
  idSucursalDestino: string
  distanciaKm: number
  precioBoleto: number
  creadoEn: string
  actualizadoEn: string
}

/** `RutaRequest`. Solo la gestiona el administrador de la sucursal de origen (que no se puede cambiar). */
export interface RutaRequest {
  idSucursalOrigen: string
  idSucursalDestino: string
  distanciaKm: number
  precioBoleto: number
}
