import type { BadgeTone } from '../../../types'

/** Etiquetas legibles de los códigos que devuelve el servicio de reportes. */
export const ETIQUETA_TIPO_INGRESO: Record<string, string> = {
  VENTA_BOLETOS: 'Boletos',
  ALQUILER: 'Alquiler',
}

export const ETIQUETA_TIPO_GASTO: Record<string, string> = {
  COMBUSTIBLE: 'Combustible',
  TALLER: 'Taller (mano de obra)',
  REPUESTO: 'Repuesto',
  DEPRECIACION: 'Depreciación',
  SALARIO_CHOFER: 'Salario del chofer',
}

export const ETIQUETA_CANAL: Record<string, string> = {
  EN_LINEA: 'En línea',
  MOSTRADOR: 'Mostrador',
}

export const ETIQUETA_TIPO_LINEA: Record<string, string> = {
  MANO_DE_OBRA: 'Mano de obra',
  REPUESTO: 'Repuesto',
}

export const ETIQUETA_ESTADO_BUS: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  EN_TRANSITO: 'En tránsito',
  EN_TALLER: 'En taller',
  FUERA_DE_SERVICIO: 'Fuera de servicio',
}

export const TONO_ESTADO_BUS: Record<string, BadgeTone> = {
  DISPONIBLE: 'success',
  EN_TRANSITO: 'info',
  EN_TALLER: 'warning',
  FUERA_DE_SERVICIO: 'danger',
}

export const ETIQUETA_ESTADO_LICENCIA: Record<string, string> = {
  VIGENTE: 'Vigente',
  POR_VENCER: 'Por vencer',
  VENCIDA: 'Vencida',
  SIN_FECHA: 'Sin fecha',
}

export const TONO_ESTADO_LICENCIA: Record<string, BadgeTone> = {
  VIGENTE: 'success',
  POR_VENCER: 'warning',
  VENCIDA: 'danger',
  SIN_FECHA: 'neutral',
}

/** Nombres de los filtros adicionales que informa el backend en `filtros.otros`. */
export const ETIQUETA_FILTRO: Record<string, string> = {
  sucursal: 'Sucursal',
  bus: 'Bus',
  ruta: 'Ruta',
  estado: 'Estado',
}

export function etiqueta(mapa: Record<string, string>, codigo: string | null | undefined): string {
  if (!codigo) return '—'
  return mapa[codigo] ?? codigo
}
