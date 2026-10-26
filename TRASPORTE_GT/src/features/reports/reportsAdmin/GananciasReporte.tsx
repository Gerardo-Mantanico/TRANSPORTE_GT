import { DataTable } from '../../../components/ui/DataTable'
import { useReporteGanancias, useSucursalesReportes } from '../../../hooks/reports'
import type { FilaGanancia } from '../../../types/reportTypes'
import { formatMonto, hoyIso } from '../../../utils/format'
import { FiltrosReporte } from '../comun/FiltrosReporte'
import { MarcoReporte } from '../comun/MarcoReporte'
import { SelectorCatalogo } from '../comun/SelectorCatalogo'
import { contarFilas, filaSubtotal, filasDeGrupos, type ColumnaReporte } from '../comun/tablaReporte'
import { useFiltrosReporte } from '../comun/useFiltrosReporte'

const COLUMNAS: ColumnaReporte<FilaGanancia>[] = [
  { titulo: 'Sucursal', celda: (f) => <strong>{f.sucursal}</strong> },
  { titulo: 'Ingresos', celda: (f) => formatMonto(f.ingresos), subtotal: 'ingresos', dinero: true },
  { titulo: 'Gastos', celda: (f) => formatMonto(f.gastos), subtotal: 'gastos', dinero: true },
  {
    titulo: 'Ganancia neta',
    celda: (f) => <span className={Number(f.ganancia) < 0 ? 'amount-negative' : ''}>{formatMonto(f.ganancia)}</span>,
    subtotal: 'ganancia',
    dinero: true,
  },
]

export function GananciasReporte({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  const control = useFiltrosReporte({ idSucursal: '' }, hoyIso())
  const sucursales = useSucursalesReportes()
  const consulta = useReporteGanancias({
    ...control.intervalo,
    idSucursal: control.aplicados.extra.idSucursal || undefined,
  })

  return (
    <MarcoReporte
      titulo={titulo}
      subtitulo={subtitulo}
      consulta={consulta}
      columnas={COLUMNAS}
      filtros={
        <FiltrosReporte control={control}>
          <SelectorCatalogo
            etiqueta="Sucursal"
            valor={control.borrador.extra.idSucursal}
            opciones={sucursales.datos}
            cargando={sucursales.cargando}
            onCambiar={(idSucursal) => control.cambiarExtra({ idSucursal })}
          />
        </FiltrosReporte>
      }
      indicadores={(r) => [
        { etiqueta: 'Ingresos', valor: formatMonto(String(r.totales.ingresos)) },
        { etiqueta: 'Gastos', valor: formatMonto(String(r.totales.gastos)) },
      ]}
      vacio={(r) => contarFilas(r.grupos) === 0}
      total={(r) => ({ etiqueta: 'GANANCIA NETA TOTAL', valor: formatMonto(String(r.totales.ganancia)) })}
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
