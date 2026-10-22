/** `ViajeDisponibleResponse`: viaje regular a la venta con sus asientos disponibles. */
export interface ViajeDisponible {
  idViaje: string
  idRuta: string | null
  idSucursalOrigen: string
  nombreOrigen: string
  nombreDestino: string
  fechaHoraSalida: string
  fechaHoraLlegadaEstimada: string
  /** Monto en quetzales como texto, p. ej. `"85.00"`. */
  precioBoleto: string
  placaBus: string | null
  capacidad: number | null
  asientosDisponibles: number
}

/** `MapaAsientosResponse`. Los asientos se numeran desde 1. */
export interface MapaAsientos {
  idViaje: string
  capacidad: number
  /** Asientos RESERVADO o CONFIRMADO, de menor a mayor. */
  ocupados: number[]
}
