import { DataTable } from '../../../components/ui/DataTable'
import { useBusesReportes, useReporteIngresosBoletos, useRutasReportes } from '../../../hooks/reports'
import type { FilaIngresoBoleto } from '../../../types/reportTypes'
import { formatFechaHora, formatMonto, hoyIso } from '../../../utils/format'
import { FiltrosReporte } from '../comun/FiltrosReporte'
import { MarcoReporte } from '../comun/MarcoReporte'
import { SelectorCatalogo } from '../comun/SelectorCatalogo'
import { contarFilas, filasDeGrupos, type ColumnaReporte } from '../comun/tablaReporte'
import { useFiltrosReporte } from '../comun/useFiltrosReporte'
import { SIN_SUCURSAL, type ReporteSucursalProps } from './props'

const COLUMNAS: ColumnaReporte<FilaIngresoBoleto>[] = [
  { titulo: 'Ruta', celda: (f) => <strong>{f.ruta}</strong> },
  { titulo: 'Salida', celda: (f) => formatFechaHora(f.fechaHoraSalida) },
  { titulo: 'Bus', celda: (f) => f.placa ?? '—' },
  { titulo: 'Boletos vendidos', celda: (f) => f.boletosVendidos },
  { titulo: 'Ingreso', celda: (f) => formatMonto(f.ingreso) },
]

export function IngresosBoletosReporte({ titulo, subtitulo, idSucursal, habilitado }: ReporteSucursalProps) {
  const control = useFiltrosReporte({ idRuta: '', idBus: '' }, hoyIso())
  const rutas = useRutasReportes(idSucursal, habilitado)
  const buses = useBusesReportes(idSucursal, habilitado)
  const consulta = useReporteIngresosBoletos(
    {
      ...control.intervalo,
      idSucursal,
      idRuta: control.aplicados.extra.idRuta || undefined,
      idBus: control.aplicados.extra.idBus || undefined,
    },
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
            etiqueta="Ruta"
            valor={control.borrador.extra.idRuta}
            opciones={rutas.datos}
            cargando={rutas.cargando}
            onCambiar={(idRuta) => control.cambiarExtra({ idRuta })}
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
        { etiqueta: 'Boletos vendidos', valor: String(r.totales.boletosVendidos) },
        { etiqueta: 'Viajes con ventas', valor: String(r.totales.viajes) },
      ]}
      vacio={(r) => contarFilas(r.grupos) === 0}
      total={(r) => ({
        etiqueta: `INGRESO TOTAL (${r.totales.boletosVendidos} boletos)`,
        valor: formatMonto(String(r.totales.ingreso)),
      })}
    >
      {(r) => <DataTable headers={COLUMNAS.map((c) => c.titulo)} rows={filasDeGrupos(r.grupos, COLUMNAS)} />}
    </MarcoReporte>
  )
}
