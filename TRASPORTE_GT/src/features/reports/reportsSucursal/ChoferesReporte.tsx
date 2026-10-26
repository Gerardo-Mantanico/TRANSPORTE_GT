import { Badge } from '../../../components/ui/Badge'
import { DataTable } from '../../../components/ui/DataTable'
import { useReporteChoferes } from '../../../hooks/reports'
import type { FilaChofer } from '../../../types/reportTypes'
import { formatDateEs, hoyIso } from '../../../utils/format'
import { ETIQUETA_ESTADO_LICENCIA, TONO_ESTADO_LICENCIA, etiqueta } from '../comun/etiquetas'
import { FiltrosReporte } from '../comun/FiltrosReporte'
import { MarcoReporte } from '../comun/MarcoReporte'
import { contarFilas, filasDeGrupos, type ColumnaReporte } from '../comun/tablaReporte'
import { useFiltrosReporte } from '../comun/useFiltrosReporte'
import { SIN_SUCURSAL, type ReporteSucursalProps } from './props'

const COLUMNAS: ColumnaReporte<FilaChofer>[] = [
  { titulo: 'Licencia', celda: (f) => f.numeroLicencia ?? '—' },
  { titulo: 'Nombre completo', celda: (f) => <strong>{f.nombre}</strong> },
  { titulo: 'Tipo', celda: (f) => f.tipoLicencia ?? '—' },
  {
    titulo: 'Vencimiento',
    celda: (f) => (
      <>
        {f.fechaVencimiento ? formatDateEs(f.fechaVencimiento) : '—'}{' '}
        <Badge tone={TONO_ESTADO_LICENCIA[f.estadoLicencia]}>
          {etiqueta(ETIQUETA_ESTADO_LICENCIA, f.estadoLicencia)}
        </Badge>
      </>
    ),
  },
  {
    titulo: 'Estado',
    celda: (f) => <Badge tone={f.activo ? 'success' : 'neutral'}>{f.activo ? 'Activo' : 'Inactivo'}</Badge>,
  },
  { titulo: 'Viajes realizados', celda: (f) => f.viajesRealizados },
]

export function ChoferesReporte({ titulo, subtitulo, idSucursal, habilitado }: ReporteSucursalProps) {
  const control = useFiltrosReporte({}, hoyIso())
  const consulta = useReporteChoferes({ ...control.intervalo, idSucursal }, habilitado)

  return (
    <MarcoReporte
      titulo={titulo}
      subtitulo={subtitulo}
      consulta={consulta}
      columnas={COLUMNAS}
      pendiente={habilitado ? null : SIN_SUCURSAL}
      filtros={<FiltrosReporte control={control} />}
      indicadores={(r) => [
        { etiqueta: 'Choferes · activos', valor: `${r.totales.choferes} · ${r.totales.activos}` },
        {
          etiqueta: 'Licencias vencidas · por vencer',
          valor: `${r.totales.licenciasVencidas} · ${r.totales.licenciasPorVencer}`,
        },
      ]}
      vacio={(r) => contarFilas(r.grupos) === 0}
    >
      {(r) => <DataTable headers={COLUMNAS.map((c) => c.titulo)} rows={filasDeGrupos(r.grupos, COLUMNAS)} />}
    </MarcoReporte>
  )
}
