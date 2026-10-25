import { DataTable } from '../../../components/ui/DataTable'
import { Badge } from '../../../components/ui/Badge'
import { useReporteGastos, useSucursalesReportes } from '../../../hooks/reports'
import type { FilaGasto, GrupoReporte, ValorTotal } from '../../../types/reportTypes'
import { formatDateEs, formatMonto, hoyIso } from '../../../utils/format'
import { ETIQUETA_TIPO_GASTO, etiqueta } from '../comun/etiquetas'
import { FiltrosReporte } from '../comun/FiltrosReporte'
import { MarcoReporte } from '../comun/MarcoReporte'
import { SelectorCatalogo } from '../comun/SelectorCatalogo'
import { contarFilas, filasDeGrupos, type ColumnaReporte } from '../comun/tablaReporte'
import { useFiltrosReporte } from '../comun/useFiltrosReporte'

const TIPOS = ['COMBUSTIBLE', 'TALLER', 'REPUESTO', 'DEPRECIACION', 'SALARIO_CHOFER'] as const

const COLUMNAS: ColumnaReporte<FilaGasto>[] = [
  { titulo: 'Sucursal', celda: (f) => f.sucursal },
  { titulo: 'Fecha', celda: (f) => formatDateEs(f.fecha) },
  {
    titulo: 'Tipo',
    celda: (f) => <Badge tone="warning">{etiqueta(ETIQUETA_TIPO_GASTO, f.tipo)}</Badge>,
    subtotal: 'gastos',
  },
  { titulo: 'Bus', celda: (f) => f.placa ?? '—' },
  { titulo: 'Descripción / categoría', celda: (f) => f.descripcion },
  { titulo: 'Monto', celda: (f) => formatMonto(f.monto), subtotal: 'monto', dinero: true },
]

function desglose(subtotales: Record<string, ValorTotal> | null | undefined) {
  return TIPOS.map((tipo) => `${ETIQUETA_TIPO_GASTO[tipo]}: ${formatMonto(String(subtotales?.[tipo] ?? '0'))}`)
    .join(' · ')
}

export function GastosReporte({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  const control = useFiltrosReporte({ idSucursal: '' }, hoyIso())
  const sucursales = useSucursalesReportes()
  const consulta = useReporteGastos({
    ...control.intervalo,
    idSucursal: control.aplicados.extra.idSucursal || undefined,
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
            onCambiar={(idSucursal) => control.cambiarExtra({ idSucursal })}
          />
        </FiltrosReporte>
      }
      indicadores={(r) => [
        { etiqueta: 'Gastos en el periodo', valor: formatMonto(String(r.totales.monto)) },
        {
          etiqueta: 'Combustible · taller y repuestos',
          valor: `${formatMonto(String(r.totales.COMBUSTIBLE))} · ${formatMonto(
            String(Number(r.totales.TALLER) + Number(r.totales.REPUESTO)),
          )}`,
        },
      ]}
      vacio={(r) => contarFilas(r.grupos) === 0}
      total={(r) => ({ etiqueta: 'TOTAL GLOBAL DE GASTOS', valor: formatMonto(String(r.totales.monto)) })}
    >
      {(r) => (
        <>
          <DataTable headers={COLUMNAS.map((c) => c.titulo)} rows={filasDeGrupos(r.grupos, COLUMNAS)} />
          <ul className="report-breakdown">
            {r.grupos.map((grupo: GrupoReporte<FilaGasto>) => (
              <li key={grupo.clave ?? 'total'}>
                <strong>{grupo.titulo}</strong>
                <span>{desglose(grupo.subtotales)}</span>
              </li>
            ))}
            <li>
              <strong>Todas las sucursales</strong>
              <span>{desglose(r.totales)}</span>
            </li>
          </ul>
        </>
      )}
    </MarcoReporte>
  )
}
