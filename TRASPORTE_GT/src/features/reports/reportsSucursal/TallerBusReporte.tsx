import { DataTable } from '../../../components/ui/DataTable'
import { useBusesReportes, useReporteTallerBus } from '../../../hooks/reports'
import type { FilaGastoTaller } from '../../../types/reportTypes'
import { formatDateEs, formatMonto, hoyIso } from '../../../utils/format'
import { ETIQUETA_TIPO_LINEA, etiqueta } from '../comun/etiquetas'
import { FiltrosReporte } from '../comun/FiltrosReporte'
import { MarcoReporte } from '../comun/MarcoReporte'
import { SelectorCatalogo } from '../comun/SelectorCatalogo'
import { contarFilas, filasDeGrupos, type ColumnaReporte } from '../comun/tablaReporte'
import { useFiltrosReporte } from '../comun/useFiltrosReporte'
import { SIN_SUCURSAL, type ReporteSucursalProps } from './props'

const COLUMNAS: ColumnaReporte<FilaGastoTaller>[] = [
  { titulo: 'Bus', celda: (f) => <strong>{f.placa}</strong> },
  { titulo: 'Categoría', celda: (f) => f.categoria, subtotal: 'lineas' },
  { titulo: 'Fecha', celda: (f) => formatDateEs(f.fecha) },
  { titulo: 'Descripción', celda: (f) => f.descripcion ?? '—' },
  { titulo: 'Tipo', celda: (f) => etiqueta(ETIQUETA_TIPO_LINEA, f.tipoLinea) },
  { titulo: 'Monto', celda: (f) => formatMonto(f.monto), subtotal: 'monto', dinero: true },
]

export function TallerBusReporte({ titulo, subtitulo, idSucursal, habilitado }: ReporteSucursalProps) {
  const control = useFiltrosReporte({ idBus: '' }, hoyIso())
  const buses = useBusesReportes(idSucursal, habilitado)
  const consulta = useReporteTallerBus(
    { ...control.intervalo, idSucursal, idBus: control.aplicados.extra.idBus || undefined },
    habilitado,
  )

  return (
    <MarcoReporte
      titulo={titulo}
      subtitulo={subtitulo}
      consulta={consulta}
      columnas={COLUMNAS}
      pendiente={habilitado ? null : SIN_SUCURSAL}
      filtros={
        <FiltrosReporte control={control}>
          <SelectorCatalogo
            etiqueta="Bus"
            todas="Todos"
            valor={control.borrador.extra.idBus}
            opciones={buses.datos}
            cargando={buses.cargando}
            onCambiar={(idBus) => control.cambiarExtra({ idBus })}
          />
        </FiltrosReporte>
      }
      indicadores={(r) => [
        { etiqueta: 'Gasto de taller', valor: formatMonto(String(r.totales.monto)) },
        { etiqueta: 'Bus con más gasto', valor: r.grupos[0]?.titulo ?? '—' },
      ]}
      vacio={(r) => contarFilas(r.grupos) === 0}
      total={(r) => ({ etiqueta: 'GRAN TOTAL DE TALLER', valor: formatMonto(String(r.totales.monto)) })}
    >
      {(r) => <DataTable headers={COLUMNAS.map((c) => c.titulo)} rows={filasDeGrupos(r.grupos, COLUMNAS)} />}
    </MarcoReporte>
  )
}
