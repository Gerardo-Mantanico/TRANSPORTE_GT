import type { BadgeTone } from '../../types'
import type {
  AlquilerResponse,
  BusResponse,
  CategoriaResponse,
  ChoferResponse,
  GastoTallerResponse,
  RutaResponse,
  SucursalResponse,
  UsuarioResponse,
  ViajeResponse,
} from '../../api/types'
import { formatDateEs } from '../../utils/format'

export function sucursalNombre(id: string | null, sucursales: SucursalResponse[]): string {
  if (!id) return '—'
  return sucursales.find((sucursal) => sucursal.id === id)?.nombre ?? '—'
}

export function estadoBusLabel(bus: BusResponse): string {
  if (!bus.activo) return 'Inactivo'
  if (bus.estadoOperativo === 'EN_TALLER') return 'En taller'
  if (bus.estadoOperativo === 'FUERA_DE_SERVICIO') return 'Inactivo'
  return 'Operativo'
}

export function estadoViajeLabel(estado: ViajeResponse['estado']): string {
  switch (estado) {
    case 'PROGRAMADO':
      return 'Programado'
    case 'EN_TRANSITO':
      return 'En tránsito'
    case 'FINALIZADO':
      return 'Completado'
    case 'PENDIENTE_ASIGNACION':
      return 'Sin asignar'
    default:
      return estado
  }
}

export function estadoViajeTone(estado: ViajeResponse['estado']): BadgeTone {
  switch (estado) {
    case 'PROGRAMADO':
      return 'warning'
    case 'EN_TRANSITO':
      return 'info'
    case 'FINALIZADO':
      return 'success'
    default:
      return 'neutral'
  }
}

export function tipoViajeLabel(tipo: ViajeResponse['tipoViaje']): string {
  return tipo === 'REGULAR' ? 'Regular' : 'Alquiler privado'
}

export function horaDe(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function fechaHoraCorta(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return `${formatDateEs(iso.slice(0, 10))} · ${horaDe(iso)}`
}

export function fechaCorta(iso: string | null): string {
  if (!iso) return '—'
  return formatDateEs(iso.slice(0, 10))
}

export interface LicenceState {
  label: string
  tone: BadgeTone
}

export function licenciaEstado(fechaVencimiento: string, hoy = new Date()): LicenceState {
  const vence = new Date(`${fechaVencimiento.slice(0, 10)}T23:59:59`)
  if (Number.isNaN(vence.getTime())) return { label: 'Vigente', tone: 'success' }
  const dias = Math.ceil((vence.getTime() - hoy.getTime()) / 86_400_000)
  if (dias < 0) return { label: 'Vencida', tone: 'danger' }
  if (dias <= 3) return { label: 'Vence en 3 días', tone: 'danger' }
  if (dias <= 15) return { label: 'Vence en 15 días', tone: 'warning' }
  return { label: 'Vigente', tone: 'success' }
}

export function estadoAlquilerLabel(estado: AlquilerResponse['estado']): string {
  switch (estado) {
    case 'SOLICITADO':
      return 'Pendiente'
    case 'COTIZADO':
      return 'Cotizado'
    case 'CONFIRMADO':
      return 'Confirmado'
    case 'FINALIZADO':
      return 'Finalizado'
    case 'CANCELADO':
      return 'Cancelado'
    default:
      return estado
  }
}

export function estadoAlquilerTone(estado: AlquilerResponse['estado']): BadgeTone {
  switch (estado) {
    case 'SOLICITADO':
      return 'warning'
    case 'COTIZADO':
      return 'info'
    case 'CONFIRMADO':
      return 'success'
    case 'FINALIZADO':
      return 'neutral'
    case 'CANCELADO':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function rolLabel(rol: UsuarioResponse['rol']): string {
  switch (rol) {
    case 'ADMIN_SISTEMA':
      return 'Administrador del sistema'
    case 'ADMIN_SUCURSAL':
      return 'Administrador de sucursal'
    case 'CAJERO':
      return 'Cajero'
    case 'CHOFER':
      return 'Chofer'
    case 'CLIENTE':
      return 'Cliente'
    default:
      return rol
  }
}

export function tipoLineaGasto(lineas: GastoTallerResponse['lineas']): string {
  const kinds = new Set(lineas.map((linea) => linea.tipo))
  if (kinds.size === 0) return '—'
  if (kinds.size > 1) return 'Mixto'
  const only = [...kinds][0]
  return only === 'MANO_DE_OBRA' ? 'Mano de obra' : 'Repuesto'
}

export function mapearTipoLicenciaFrontend(valor: string): 'A' | 'B' | 'C' | 'M' | 'E' {
  const upper = valor.toUpperCase()
  if (upper === 'A' || upper === 'B' || upper === 'C' || upper === 'M' || upper === 'E') return upper
  if (upper.startsWith('A')) return 'A'
  if (upper.startsWith('B')) return 'B'
  return 'B'
}

export function mapearTipoLineaBackend(valor: string): 'MANO_DE_OBRA' | 'REPUESTO' {
  return valor.toLowerCase().includes('repuesto') ? 'REPUESTO' : 'MANO_DE_OBRA'
}

export type { BusResponse, ChoferResponse, RutaResponse, CategoriaResponse, SucursalResponse }
