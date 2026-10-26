import type { DefinicionReporte } from '../reportsAdmin/definiciones'

export type ReporteSucursalId = 'buses' | 'choferes' | 'boletos' | 'alquileres' | 'depreciacion' | 'taller'

export const REPORTES_SUCURSAL: DefinicionReporte<ReporteSucursalId>[] = [
  { id: 'buses', titulo: 'Listado de buses', subtitulo: 'Estado, chofer actual y viajes realizados', icono: 'bus' },
  { id: 'choferes', titulo: 'Listado de choferes', subtitulo: 'Licencias y viajes realizados', icono: 'users' },
  { id: 'boletos', titulo: 'Ingresos por boletos', subtitulo: 'Ventas por viaje, ruta y bus', icono: 'ticket' },
  { id: 'alquileres', titulo: 'Ingresos por alquileres', subtitulo: 'Servicios privados pagados', icono: 'calendar' },
  { id: 'depreciacion', titulo: 'Depreciación por bus', subtitulo: 'Kilómetros y costo acumulado', icono: 'chart' },
  { id: 'taller', titulo: 'Gastos de taller', subtitulo: 'Por bus y categoría', icono: 'wrench' },
]
