import { DataTable } from '../../../components/ui/DataTable'
import { useBusesReportes, useReporteTallerCategoria, useSucursalesReportes } from '../../../hooks/reports'
import type { FilaGastoTaller } from '../../../types/reportTypes'
import { formatDateEs, formatMonto, hoyIso } from '../../../utils/format'
import { ETIQUETA_TIPO_LINEA, etiqueta } from '../comun/etiquetas'
import { FiltrosReporte } from '../comun/FiltrosReporte'
import { MarcoReporte } from '../comun/MarcoReporte'
import { SelectorCatalogo } from '../comun/SelectorCatalogo'
import { contarFilas, filasDeGrupos, type ColumnaReporte } from '../comun/tablaReporte'
import { useFiltrosReporte } from '../comun/useFiltrosReporte'

const COLUMNAS: ColumnaReporte<FilaGastoTaller>[] = [
  { titulo: 'Categoría', celda: (f) => f.categoria },
  {
    titulo: 'Bus',
    celda: (f) => (
      <>
        <strong>{f.placa}</strong>
        <small className="cell-note">{f.sucursal}</small>
      </>
    ),
    subtotal: 'lineas',
  },
  { titulo: 'Fecha', celda: (f) => formatDateEs(f.fecha) },
  { titulo: 'Descripción', celda: (f) => f.descripcion ?? '—' },
  { titulo: 'Tipo', celda: (f) => etiqueta(ETIQUETA_TIPO_LINEA, f.tipoLinea) },
  { titulo: 'Monto', celda: (f) => formatMonto(f.monto), subtotal: 'monto', dinero: true },
]

export function TallerCategoriaReporte({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  const control = useFiltrosReporte({ idSucursal: '', idBus: '' }, hoyIso())
  const sucursales = useSucursalesReportes()
  const buses = useBusesReportes(control.borrador.extra.idSucursal || undefined)
  const consulta = useReporteTallerCategoria({
    ...control.intervalo,
    idSucursal: control.aplicados.extra.idSucursal || undefined,
    idBus: control.aplicados.extra.idBus || undefined,
  })

  return (
    <MarcoReporte
      titulo={titulo}
      subtitulo={subtitulo}
      consulta={consulta}
      filtros={
        <FiltrosReporte control={control}>
          <SelectorCatalogo
            etiqueta="Sucursal"
            valor={control.borrador.extra.idSucursal}
            opciones={sucursales.datos}
            cargando={sucursales.cargando}
            onCambiar={(idSucursal) => control.cambiarExtra({ idSucursal, idBus: '' })}
          />
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
        { etiqueta: 'Categoría con más gasto', valor: r.grupos[0]?.titulo ?? '—' },
      ]}
      vacio={(r) => contarFilas(r.grupos) === 0}
      total={(r) => ({ etiqueta: 'GRAN TOTAL DE TALLER', valor: formatMonto(String(r.totales.monto)) })}
    >
      {(r) => <DataTable headers={COLUMNAS.map((c) => c.titulo)} rows={filasDeGrupos(r.grupos, COLUMNAS)} />}
    </MarcoReporte>
  )
}
