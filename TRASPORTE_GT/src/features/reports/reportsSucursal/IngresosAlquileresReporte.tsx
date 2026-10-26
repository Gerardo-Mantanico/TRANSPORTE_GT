import { DataTable } from '../../../components/ui/DataTable'
import { useReporteIngresosAlquileres } from '../../../hooks/reports'
import type { FilaIngresoAlquiler } from '../../../types/reportTypes'
import { formatDateEs, formatFechaHora, formatMonto, hoyIso } from '../../../utils/format'
import { FiltrosReporte } from '../comun/FiltrosReporte'
import { MarcoReporte } from '../comun/MarcoReporte'
import { contarFilas, filasDeGrupos, type ColumnaReporte } from '../comun/tablaReporte'
import { useFiltrosReporte } from '../comun/useFiltrosReporte'
import { SIN_SUCURSAL, type ReporteSucursalProps } from './props'

const COLUMNAS: ColumnaReporte<FilaIngresoAlquiler>[] = [
  {
    titulo: 'Cliente',
    celda: (f) => (
      <>
        <strong>{f.cliente ?? '—'}</strong>
        <small className="cell-note">NIT {f.nit ?? '—'}</small>
      </>
    ),
  },
  { titulo: 'Origen → destino', celda: (f) => `${f.origen ?? '—'} → ${f.destino ?? '—'}` },
  { titulo: 'Salida', celda: (f) => formatFechaHora(f.fechaSalida) },
  { titulo: 'Retorno', celda: (f) => (f.fechaRetorno ? formatFechaHora(f.fechaRetorno) : 'Solo ida') },
  { titulo: 'Bus asignado', celda: (f) => f.placa ?? 'Pendiente' },
  { titulo: 'Fecha de pago', celda: (f) => formatDateEs(f.fechaPago) },
  { titulo: 'Precio total', celda: (f) => formatMonto(f.precioTotal) },
]

export function IngresosAlquileresReporte({ titulo, subtitulo, idSucursal, habilitado }: ReporteSucursalProps) {
  const control = useFiltrosReporte({}, hoyIso())
  const consulta = useReporteIngresosAlquileres({ ...control.intervalo, idSucursal }, habilitado)

  return (
    <MarcoReporte
      titulo={titulo}
      subtitulo={subtitulo}
      consulta={consulta}
      columnas={COLUMNAS}
      pendiente={habilitado ? null : SIN_SUCURSAL}
      filtros={<FiltrosReporte control={control} />}
      indicadores={(r) => [
        { etiqueta: 'Alquileres pagados', valor: String(r.totales.alquileres) },
        { etiqueta: 'Ingreso por alquileres', valor: formatMonto(String(r.totales.precioTotal)) },
      ]}
      vacio={(r) => contarFilas(r.grupos) === 0}
      total={(r) => ({ etiqueta: 'TOTAL POR ALQUILERES', valor: formatMonto(String(r.totales.precioTotal)) })}
    >
      {(r) => <DataTable headers={COLUMNAS.map((c) => c.titulo)} rows={filasDeGrupos(r.grupos, COLUMNAS)} />}
    </MarcoReporte>
  )
}
