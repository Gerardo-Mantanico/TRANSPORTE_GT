export type EstadoAlquiler = 'SOLICITADO' | 'COTIZADO' | 'CONFIRMADO' | 'FINALIZADO' | 'CANCELADO'

export const ESTADOS_ALQUILER: EstadoAlquiler[] = ['SOLICITADO', 'COTIZADO', 'CONFIRMADO', 'FINALIZADO', 'CANCELADO']

export const ETIQUETAS_ESTADO_ALQUILER: Record<EstadoAlquiler, string> = {
  SOLICITADO: 'Solicitado',
  COTIZADO: 'Cotizado',
  CONFIRMADO: 'Confirmado',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
}

export type CanalAlquiler = 'EN_LINEA' | 'MOSTRADOR'

export const ETIQUETAS_CANAL_ALQUILER: Record<CanalAlquiler, string> = {
  EN_LINEA: 'En línea',
  MOSTRADOR: 'Presencial',
}

export type TipoCotizacion = 'ESTIMADA' | 'AJUSTADA_ADMIN'

/** `CotizacionAlquilerResponse`: historial de precios (estimado del sistema y ajustes del administrador). */
export interface CotizacionAlquiler {
  id: string
  tipo: TipoCotizacion
  precio: number
  idUsuario: string | null
  comentario: string | null
  creadoEn: string
}

/** `AlquilerResponse`. Los montos y coordenadas llegan como número. */
export interface Alquiler {
  id: string
  canal: CanalAlquiler
  estado: EstadoAlquiler
  /** null en mostrador: el cliente no necesita cuenta. */
  idUsuarioCliente: string | null
  nombreCliente: string
  /** Normalizado; `CF` en mostrador sin NIT. */
  nitCliente: string
  idSucursalOrigen: string
  origen: string
  destino: string
  fechaHoraSalida: string
  fechaHoraRetorno: string | null
  /** La fija el administrador al cotizar. */
  fechaHoraLlegadaEstimada: string | null
  idaYVuelta: boolean
  numeroPasajeros: number
  latitudOrigen: number | null
  longitudOrigen: number | null
  latitudDestino: number | null
  longitudDestino: number | null
  distanciaEstimadaKm: number
  precioEstimado: number
  precioFinal: number | null
  idPago: string | null
  fechaPago: string | null
  /** Lo crea Viajes al confirmarse el alquiler. */
  idViaje: string | null
  idBus: string | null
  placaBus: string | null
  idChofer: string | null
  nombreChofer: string | null
  motivoCancelacion: string | null
  canceladoEn: string | null
  version: number
  creadoEn: string
  /** Solo en el detalle. */
  cotizaciones: CotizacionAlquiler[] | null
}

/** Coordenadas elegidas en el mapa: las cuatro juntas o ninguna. */
export interface CoordenadasAlquiler {
  latitudOrigen: number
  longitudOrigen: number
  latitudDestino: number
  longitudDestino: number
}

/**
 * `SolicitudAlquilerRequest`. Con coordenadas el backend calcula la distancia (e ignora `distanciaEstimadaKm`);
 * sin ellas, `distanciaEstimadaKm` es obligatoria.
 */
export interface SolicitudAlquilerRequest extends Partial<CoordenadasAlquiler> {
  idSucursalOrigen: string
  origen: string
  destino: string
  /** ISO con zona. */
  fechaHoraSalida: string
  idaYVuelta: boolean
  /** Solo en ida y vuelta. */
  fechaHoraRetorno?: string | null
  numeroPasajeros: number
  distanciaEstimadaKm?: number | null
}

/** `SolicitudMostradorRequest`: anidada; sin NIT (o CF) se registra como consumidor final. */
export interface SolicitudMostradorRequest {
  solicitud: SolicitudAlquilerRequest
  nitCliente?: string | null
  nombreCliente: string
}

/** `CotizacionRequest`. */
export interface CotizacionRequest {
  precioFinal: number
  /** ISO con zona; en ida y vuelta es el regreso al origen (no antes del retorno). */
  fechaHoraLlegadaEstimada: string
  comentario?: string | null
}

/** `PagoAlquilerRequest`: `fechaPago` `YYYY-MM-DD` la elige el usuario. */
export interface PagoAlquilerRequest {
  fechaPago: string
}
