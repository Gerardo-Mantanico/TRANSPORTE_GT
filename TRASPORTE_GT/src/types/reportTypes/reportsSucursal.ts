import type { FiltroFechas } from './comun'

export type EstadoOperativoBus = 'DISPONIBLE' | 'EN_TRANSITO' | 'EN_TALLER' | 'FUERA_DE_SERVICIO'
export type EstadoLicencia = 'VIGENTE' | 'POR_VENCER' | 'VENCIDA' | 'SIN_FECHA'

/** El ADMIN_SUCURSAL omite `idSucursal` (sale del token); el ADMIN_SISTEMA lo indica. */
export interface FiltroSucursal extends FiltroFechas {
  idSucursal?: string
}

export interface FiltroBuses extends FiltroSucursal {
  estado?: EstadoOperativoBus
}

export interface FiltroIngresosBoletos extends FiltroSucursal {
  idRuta?: string
  idBus?: string
}

export interface FiltroTallerBus extends FiltroSucursal {
  idBus?: string
}

/** Reporte 7. */
export interface FilaBus {
  idBus: string
  placa: string
  marca: string | null
  modelo: string | null
  capacidad: number | null
  estadoOperativo: EstadoOperativoBus | null
  chofer: string | null
  kilometrajeActual: number
  viajesRealizados: number
  activo: boolean
}

/** Reporte 8. */
export interface FilaChofer {
  idChofer: string
  numeroLicencia: string | null
  nombre: string
  tipoLicencia: string | null
  fechaVencimiento: string | null
  estadoLicencia: EstadoLicencia
  activo: boolean
  viajesRealizados: number
}

/** Reporte 9. */
export interface FilaIngresoBoleto {
  idViaje: string
  ruta: string
  fechaHoraSalida: string | null
  placa: string | null
  boletosVendidos: number
  ingreso: string
}

/** Reporte 10. */
export interface FilaIngresoAlquiler {
  idAlquiler: string
  cliente: string | null
  nit: string | null
  origen: string | null
  destino: string | null
  fechaSalida: string | null
  fechaRetorno: string | null
  placa: string | null
  fechaPago: string
  precioTotal: string
}

/** Reporte 11. */
export interface FilaDepreciacionBus {
  idBus: string
  placa: string
  kmRecorridos: number
  montoPorKmActual: string | null
  depreciacionAcumulada: string
  promedioPorKm: string
}
