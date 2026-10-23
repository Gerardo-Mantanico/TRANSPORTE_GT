export type RolBackend =
  | 'ADMIN_SISTEMA'
  | 'ADMIN_SUCURSAL'
  | 'CAJERO'
  | 'CHOFER'
  | 'CLIENTE'

export interface PaginaResponse<T> {
  contenido: T[]
  pagina: number
  tamano: number
  totalElementos: number
  totalPaginas: number
}

export interface RespuestaError {
  timestamp: string
  status: number
  error: string
  codigo: string
  ruta: string
}

export interface UsuarioSesion {
  id: string
  correo: string
  nombreCompleto: string
  rol: RolBackend
  idSucursal: string | null
}

export interface LoginResponse {
  token: string
  expiraEn: string
  usuario: UsuarioSesion
}

export interface UsuarioResponse {
  id: string
  correo: string
  nombreCompleto: string
  rol: RolBackend
  idSucursal: string | null
  nombreSucursal: string | null
  activo: boolean
  activacionPendiente: boolean
  version: number
  creadoEn: string
}

export interface SucursalResponse {
  id: string
  nombre: string
  departamento: string | null
  direccion: string | null
  telefono: string | null
  latitud: number | null
  longitud: number | null
  activa: boolean
  version: number
  creadoEn: string
  actualizadoEn: string | null
}

export type EstadoOperativo = 'DISPONIBLE' | 'EN_TRANSITO' | 'EN_TALLER' | 'FUERA_DE_SERVICIO'

export interface BusResponse {
  id: string
  idSucursal: string
  placa: string
  marca: string
  modelo: string
  anioFabricacion: number
  capacidadPasajeros: number
  kilometrajeActual: number | null
  fotoUrl: string | null
  estadoOperativo: EstadoOperativo
  activo: boolean
  version: number
  creadoEn: string
  actualizadoEn: string | null
}

export type TipoLicencia = 'A' | 'B' | 'C' | 'M' | 'E'

export interface ChoferResponse {
  id: string
  idUsuario: string | null
  idSucursal: string
  nombreCompleto: string
  correo: string
  telefono: string
  numeroLicencia: string
  tipoLicencia: TipoLicencia
  fechaVencimientoLicencia: string
  salarioBaseViaje: number
  fotoUrl: string | null
  activo: boolean
  version: number
  creadoEn: string
  actualizadoEn: string | null
}

export type EstadoViaje = 'PROGRAMADO' | 'PENDIENTE_ASIGNACION' | 'EN_TRANSITO' | 'FINALIZADO'
export type TipoViaje = 'REGULAR' | 'ALQUILER_PRIVADO'

export interface BusResumenViaje {
  idBus: string
  placa: string
  capacidad: number
  estadoOperativo: EstadoOperativo
  activo: boolean
}

export interface ChoferResumenViaje {
  idChofer: string
  nombreCompleto: string
  fechaVencimientoLicencia: string | null
  salarioBaseViaje: number
  activo: boolean
}

export interface RegistroSalidaResponse {
  id: string
  fechaHoraSalidaReal: string
  kilometrajeInicial: number
  registradoPor: string
}

export interface RegistroLlegadaResponse {
  id: string
  fechaHoraLlegadaReal: string
  kilometrajeFinal: number
  distanciaRecorridaKm: number
  gastoCombustibleTotal: number
  salarioBaseChofer: number
  registradoPor: string
}

export interface ViajeResponse {
  id: string
  tipoViaje: TipoViaje
  estado: EstadoViaje
  idRuta: string
  idSucursalOrigen: string
  nombreOrigen: string
  nombreDestino: string
  idAlquiler: string | null
  fechaHoraSalida: string
  fechaHoraLlegadaEstimada: string | null
  precioBoleto: number
  numeroPasajeros: number | null
  bus: BusResumenViaje | null
  chofer: ChoferResumenViaje | null
  registroSalida: RegistroSalidaResponse | null
  registroLlegada: RegistroLlegadaResponse | null
  version: number
}

export interface RutaResponse {
  id: string
  idSucursalOrigen: string
  idSucursalDestino: string
  distanciaKm: number
  precioBoleto: number
  creadoEn: string
  actualizadoEn: string | null
}

export type EstadoAlquiler =
  | 'SOLICITADO'
  | 'COTIZADO'
  | 'CONFIRMADO'
  | 'FINALIZADO'
  | 'CANCELADO'

export interface CotizacionAlquilerResponse {
  id: string
  tipo: 'ESTIMADA' | 'AJUSTADA_ADMIN'
  precio: number
  idUsuario: string | null
  comentario: string | null
  creadoEn: string
}

export interface AlquilerResponse {
  id: string
  canal: 'EN_LINEA' | 'MOSTRADOR'
  estado: EstadoAlquiler
  idUsuarioCliente: string | null
  nombreCliente: string
  nitCliente: string
  idSucursalOrigen: string
  origen: string
  destino: string
  fechaHoraSalida: string
  fechaHoraRetorno: string | null
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
  idViaje: string | null
  idBus: string | null
  placaBus: string | null
  idChofer: string | null
  nombreChofer: string | null
  motivoCancelacion: string | null
  canceladoEn: string | null
  version: number
  creadoEn: string
  cotizaciones: CotizacionAlquilerResponse[] | null
}

export interface SolicitudAlquilerRequest {
  idSucursalOrigen: string
  origen: string
  destino: string
  fechaHoraSalida: string
  idaYVuelta?: boolean | null
  fechaHoraRetorno?: string | null
  numeroPasajeros: number
  distanciaEstimadaKm?: number
}

export interface CategoriaResponse {
  id: string
  nombre: string
  descripcion: string | null
  activa: boolean
  creadoEn: string
}

export interface LineaGastoTaller {
  id: string
  idCategoria: string
  nombreCategoria: string
  descripcion: string
  tipo: 'MANO_DE_OBRA' | 'REPUESTO'
  monto: number
}

export interface GastoTallerResponse {
  id: string
  idBus: string
  idSucursal: string
  fechaServicio: string
  total: number
  observaciones: string | null
  registradoPor: string
  creadoEn: string
  lineas: LineaGastoTaller[]
}

export interface TarifaDepreciacionResponse {
  id: string
  montoPorKm: number
  vigenteDesde: string
  creadoPor: string
  creadoEn: string
}

export interface CarteraResponse {
  idCartera: string
  saldo: string
  actualizadoEn: string
}

export interface MovimientoResponse {
  idMovimiento: string
  tipo: 'RECARGA' | 'PAGO' | 'REEMBOLSO'
  monto: string
  saldoPosterior: string
  tipoReferencia: 'BOLETOS' | 'ALQUILER' | null
  idReferencia: string | null
  fechaMovimiento: string
  descripcion: string
  creadoEn: string
}

export interface ClienteResponse {
  idUsuario: string
  nombreCompleto: string
  correo: string
  nit: string | null
  dpi: string | null
  telefono: string | null
  direccion: string | null
  activo: boolean
  saldo: string
}
