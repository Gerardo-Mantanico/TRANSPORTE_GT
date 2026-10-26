import { Badge } from '../../../components/ui/Badge'
import { DataTable } from '../../../components/ui/DataTable'
import { useReporteBuses } from '../../../hooks/reports'
import type { EstadoOperativoBus, FilaBus } from '../../../types/reportTypes'
import { hoyIso } from '../../../utils/format'
import { ETIQUETA_ESTADO_BUS, TONO_ESTADO_BUS, etiqueta } from '../comun/etiquetas'
import { FiltrosReporte } from '../comun/FiltrosReporte'
import { MarcoReporte } from '../comun/MarcoReporte'
import { contarFilas, filasDeGrupos, type ColumnaReporte } from '../comun/tablaReporte'
import { useFiltrosReporte } from '../comun/useFiltrosReporte'
import { SIN_SUCURSAL, type ReporteSucursalProps } from './props'

const COLUMNAS: ColumnaReporte<FilaBus>[] = [
  {
    titulo: 'Placa',
    celda: (f) => (
      <>
        <strong>{f.placa}</strong>
        {!f.activo && <Badge tone="neutral">Inactivo</Badge>}
      </>
    ),
  },
  { titulo: 'Marca / modelo', celda: (f) => [f.marca, f.modelo].filter(Boolean).join(' ') || '—' },
  { titulo: 'Capacidad', celda: (f) => f.capacidad ?? '—' },
  {
    titulo: 'Estado',
    celda: (f) => (
      <Badge tone={TONO_ESTADO_BUS[f.estadoOperativo ?? ''] ?? 'neutral'}>
        {etiqueta(ETIQUETA_ESTADO_BUS, f.estadoOperativo)}
      </Badge>
    ),
  },
  { titulo: 'Chofer asignado', celda: (f) => f.chofer ?? 'Sin asignar' },
  { titulo: 'Kilometraje', celda: (f) => `${Number(f.kilometrajeActual).toLocaleString('es-GT')} km` },
  { titulo: 'Viajes realizados', celda: (f) => f.viajesRealizados },
]

export function BusesReporte({ titulo, subtitulo, idSucursal, habilitado }: ReporteSucursalProps) {
  const control = useFiltrosReporte({ estado: '' as EstadoOperativoBus | '' }, hoyIso())
  const consulta = useReporteBuses(
    { ...control.intervalo, idSucursal, estado: control.aplicados.extra.estado || undefined },
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
          <label className="field">
            <span className="field-label">
              <span>Estado operativo</span>
            </span>
            <select
              value={control.borrador.extra.estado}
              onChange={(event) => control.cambiarExtra({ estado: event.target.value as EstadoOperativoBus | '' })}
            >
              <option value="">Todos</option>
              {Object.entries(ETIQUETA_ESTADO_BUS).map(([codigo, nombre]) => (
                <option key={codigo} value={codigo}>
                  {nombre}
                </option>
              ))}
            </select>
          </label>
        </FiltrosReporte>
      }
      indicadores={(r) => [
        { etiqueta: 'Buses · activos', valor: `${r.totales.buses} · ${r.totales.activos}` },
        { etiqueta: 'Viajes realizados', valor: String(r.totales.viajesRealizados) },
      ]}
      vacio={(r) => contarFilas(r.grupos) === 0}
    >
      {(r) => <DataTable headers={COLUMNAS.map((c) => c.titulo)} rows={filasDeGrupos(r.grupos, COLUMNAS)} />}
    </MarcoReporte>
  )
}
