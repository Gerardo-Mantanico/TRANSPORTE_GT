import type { IconName } from '../../../types'

export type ReporteAdminId = 'ingresos' | 'gastos' | 'ganancias' | 'rutas' | 'taller' | 'mapa'

export interface DefinicionReporte<Id extends string> {
  id: Id
  titulo: string
  subtitulo: string
  icono: IconName
}

export const REPORTES_ADMIN: DefinicionReporte<ReporteAdminId>[] = [
  { id: 'ingresos', titulo: 'Ingresos monetarios', subtitulo: 'Ingresos por sucursal con subtotales', icono: 'chart' },
  { id: 'gastos', titulo: 'Gastos monetarios', subtitulo: 'Combustible, taller, depreciación y salarios', icono: 'wallet' },
  { id: 'ganancias', titulo: 'Ganancias monetarias', subtitulo: 'Resultado neto por sucursal', icono: 'chart' },
  { id: 'rutas', titulo: 'Rutas más demandadas', subtitulo: 'Ranking por boletos vendidos', icono: 'route' },
  { id: 'taller', titulo: 'Taller por categoría', subtitulo: 'Dónde se concentra el mantenimiento', icono: 'wrench' },
  { id: 'mapa', titulo: 'Mapa de rutas', subtitulo: 'Rutas que salen de una sucursal', icono: 'grid' },
]
