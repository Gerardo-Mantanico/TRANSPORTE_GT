import { ETIQUETAS_ESTADO_OPERATIVO, type Bus, type Chofer } from '../types/fleetTypes'

/** Bus elegible: activo y ni en taller ni fuera de servicio (EN_TRANSITO sí: puede tener viajes futuros). */
export function motivoBusNoElegible(bus: Bus, pasajeros?: number | null): string | null {
  if (!bus.activo) return 'inactivo'
  if (bus.estadoOperativo === 'EN_TALLER' || bus.estadoOperativo === 'FUERA_DE_SERVICIO')
    return ETIQUETAS_ESTADO_OPERATIVO[bus.estadoOperativo].toLowerCase()
  if (pasajeros && bus.capacidadPasajeros < pasajeros) return `${bus.capacidadPasajeros} asientos, no alcanza`
  return null
}

/** Chofer elegible: activo y con licencia vigente hasta la llegada estimada (`YYYY-MM-DD`). */
export function motivoChoferNoElegible(chofer: Chofer, fechaLlegada: string): string | null {
  if (!chofer.activo) return 'inactivo'
  if (fechaLlegada && chofer.fechaVencimientoLicencia < fechaLlegada) return 'licencia vence antes de llegar'
  return null
}
