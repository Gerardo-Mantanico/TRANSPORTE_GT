import type { FiltroFechas } from './comun'

export type TipoIngreso = 'VENTA_BOLETOS' | 'ALQUILER'
export type TipoGastoReporte = 'COMBUSTIBLE' | 'TALLER' | 'REPUESTO' | 'DEPRECIACION' | 'SALARIO_CHOFER'

export interface FiltroPorSucursal extends FiltroFechas {
  idSucursal?: string
}

export interface FiltroTallerCategoria extends FiltroPorSucursal {
  idBus?: string
}

/** Reporte 1. */
export interface FilaIngreso {
  idSucursal: string
  sucursal: string
  fecha: string
  tipo: TipoIngreso
  referencia: string
  /** Ruta (origen → destino) o trayecto del alquiler. */
  descripcion: string
  cliente: string | null
  nit: string | null
  cantidadBoletos: number | null
  canal: 'EN_LINEA' | 'MOSTRADOR' | null
  monto: string
}

/** Reporte 2. */
export interface FilaGasto {
  idSucursal: string
  sucursal: string
  fecha: string
  tipo: TipoGastoReporte
  referencia: string
  placa: string | null
  descripcion: string
  monto: string
}

/** Reporte 3. */
export interface FilaGanancia {
  idSucursal: string
  sucursal: string
  ingresos: string
  gastos: string
  ganancia: string
}

/** Reporte 4. */
export interface FilaRutaDemandada {
  idRuta: string
  origen: string
  destino: string
  distanciaKm: number | null
  precioBoleto: string
  boletosVendidos: number
  viajesConVentas: number
  ingreso: string
  eliminada: boolean
}

/** Reportes 5 y 12. */
export interface FilaGastoTaller {
  categoria: string
  idBus: string | null
  placa: string
  sucursal: string
  fecha: string
  descripcion: string | null
  tipoLinea: 'MANO_DE_OBRA' | 'REPUESTO' | null
  monto: string
}

/** Reporte 6. */
export interface FilaMapaRuta {
  idRuta: string
  origen: string
  latitudOrigen: number | null
  longitudOrigen: number | null
  destino: string
  latitudDestino: number | null
  longitudDestino: number | null
  distanciaKm: number | null
  precioBoleto: string
}
