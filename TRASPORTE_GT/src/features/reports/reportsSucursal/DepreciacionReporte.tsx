import { DataTable } from '../../../components/ui/DataTable'
import { useReporteDepreciacionBuses } from '../../../hooks/reports'
import type { FilaDepreciacionBus } from '../../../types/reportTypes'
import { formatMonto, hoyIso } from '../../../utils/format'
import { FiltrosReporte } from '../comun/FiltrosReporte'
import { MarcoReporte } from '../comun/MarcoReporte'
import { contarFilas, filaSubtotal, filasDeGrupos, type ColumnaReporte } from '../comun/tablaReporte'
import { useFiltrosReporte } from '../comun/useFiltrosReporte'
import { SIN_SUCURSAL, type ReporteSucursalProps } from './props'

const COLUMNAS: ColumnaReporte<FilaDepreciacionBus>[] = [
  { titulo: 'Bus', celda: (f) => <strong>{f.placa}</strong> },
  {
    titulo: 'Km recorridos',
    celda: (f) => `${Number(f.kmRecorridos).toLocaleString('es-GT')} km`,
    subtotal: 'kmRecorridos',
  },
  {
    titulo: 'Monto por km (vigente)',
    celda: (f) => formatMonto(f.montoPorKmActual),
    subtotal: 'montoPorKmActual',
    dinero: true,
  },
  {
    titulo: 'Depreciación acumulada',
    celda: (f) => formatMonto(f.depreciacionAcumulada),
    subtotal: 'depreciacionAcumulada',
    dinero: true,
  },
  {
    titulo: 'Promedio aplicado por km',
    celda: (f) => formatMonto(f.promedioPorKm),
    subtotal: 'promedioPorKm',
    dinero: true,
  },
]

export function DepreciacionReporte({ titulo, subtitulo, idSucursal, habilitado }: ReporteSucursalProps) {
  const control = useFiltrosReporte({}, hoyIso())
  const consulta = useReporteDepreciacionBuses({ ...control.intervalo, idSucursal }, habilitado)

  return (
    <MarcoReporte
      titulo={titulo}
      subtitulo={subtitulo}
      consulta={consulta}
      columnas={COLUMNAS}
      pendiente={habilitado ? null : SIN_SUCURSAL}
      filtros={<FiltrosReporte control={control} />}
      indicadores={(r) => [
        { etiqueta: 'Km recorridos', valor: `${Number(r.totales.kmRecorridos).toLocaleString('es-GT')} km` },
        { etiqueta: 'Tarifa vigente', valor: formatMonto(r.totales.montoPorKmActual as string | undefined) },
      ]}
      vacio={(r) => contarFilas(r.grupos) === 0}
      total={(r) => ({
        etiqueta: 'DEPRECIACIÓN ACUMULADA TOTAL',
        valor: formatMonto(String(r.totales.depreciacionAcumulada)),
      })}
    >
      {(r) => (
        <DataTable
          headers={COLUMNAS.map((c) => c.titulo)}
          rows={[...filasDeGrupos(r.grupos, COLUMNAS), filaSubtotal('Totales', COLUMNAS, r.totales)]}
        />
      )}
    </MarcoReporte>
  )
}
