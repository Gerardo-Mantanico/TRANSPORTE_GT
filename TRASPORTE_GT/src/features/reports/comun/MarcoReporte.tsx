import type { ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import type { ResultadoConsulta } from '../../../hooks/useConsulta'
import type { Mutacion } from '../../../hooks/useMutacion'
import type { ReporteTabla } from '../../../types/reportTypes'
import { formatDateEs, formatFechaHora } from '../../../utils/format'
import { ETIQUETA_FILTRO } from './etiquetas'
import type { ColumnaReporte } from './tablaReporte'

export interface Indicador {
  etiqueta: string
  valor: string
}

interface MarcoReporteProps<F> {
  titulo: string
  subtitulo: string
  consulta: ResultadoConsulta<ReporteTabla<F>> & { exportacionJasper: Mutacion<void, void> }
  filtros: ReactNode
  /** Tres indicadores para la franja de resumen. */
  indicadores: (reporte: ReporteTabla<F>) => Indicador[]
  /** Tabla (o mapa + tabla) del reporte. */
  children: (reporte: ReporteTabla<F>) => ReactNode
  total?: (reporte: ReporteTabla<F>) => Indicador
  /** Mensaje cuando la consulta está deshabilitada (falta elegir sucursal). */
  pendiente?: string | null
  vacio: (reporte: ReporteTabla<F>) => boolean
  columnas?: ColumnaReporte<F>[]
}

function periodo(reporte: ReporteTabla<unknown>): string {
  const { desde, hasta } = reporte.filtros
  if (!desde && !hasta) return 'Todo el historial'
  return `${desde ? formatDateEs(desde) : 'inicio'} — ${hasta ? formatDateEs(hasta) : 'hoy'}`
}

/** Estructura común de los 12 reportes: encabezado, filtros, resumen, contenido y exportaciones. */
export function MarcoReporte<F>({
  titulo,
  subtitulo,
  consulta,
  filtros,
  indicadores,
  children,
  total,
  pendiente,
  vacio,
  columnas,
}: MarcoReporteProps<F>) {
  const reporte = consulta.datos
  const exportarPdf = async () => {
    if (!reporte || !columnas) return
    const { descargarReportePdf } = await import('./ReportePdf')
    await descargarReportePdf(reporte, columnas)
  }
  const exportarExcel = async () => {
    if (!reporte || !columnas) return
    const { descargarReporteExcel } = await import('./ReporteExcel')
    await descargarReporteExcel(reporte, columnas)
  }

  return (
    <section className="surface report-detail">
      <div className="report-header">
        <div>
          <span className="eyebrow">Reporte seleccionado</span>
          <h2>{reporte?.titulo ?? titulo}</h2>
          <p>{subtitulo}</p>
          {reporte && (
            <p>
              Generado: {formatFechaHora(reporte.generadoEn)}
              {Object.entries(reporte.filtros.otros).map(([clave, valor]) => (
                <span key={clave}>
                  {' · '}
                  {ETIQUETA_FILTRO[clave] ?? clave}: <strong>{valor}</strong>
                </span>
              ))}
            </p>
          )}
        </div>
         <div className="report-export-actions">
           <Button variant="secondary" icon="download" onClick={() => void exportarExcel()} disabled={!reporte || !columnas}>
             Excel
           </Button>
           <Button icon="download" onClick={() => void exportarPdf()} disabled={!reporte || !columnas}>
             PDF
           </Button>
           <Button
             variant="secondary"
             className="report-jasper-button"
             icon="download"
             title="Generar y descargar el reporte mediante JasperReports"
             aria-label="Descargar PDF generado con JasperReports"
             onClick={() => void consulta.exportacionJasper.ejecutar()}
             disabled={!reporte || consulta.exportacionJasper.cargando}
           >
             {consulta.exportacionJasper.cargando ? 'Generando PDF…' : 'Descargar PDF Jasper'}
           </Button>
         </div>
      </div>
      {consulta.exportacionJasper.error && (
        <div className="report-export-error" role="alert">{consulta.exportacionJasper.error.message}</div>
      )}
      {filtros}
      {pendiente ? (
        <Aviso icono="search" titulo={pendiente} detalle="Elija una opción en los filtros para generar el reporte." />
      ) : consulta.error ? (
        <Aviso
          icono="close"
          titulo="No se pudo generar el reporte"
          detalle={consulta.error.message}
          accion={
            <Button variant="secondary" onClick={consulta.recargar}>
              Reintentar
            </Button>
          }
        />
      ) : !reporte || consulta.cargando ? (
        <Aviso icono="clock" titulo="Generando reporte…" detalle="Consultando las proyecciones de reportes." />
      ) : (
        <>
          <div className="report-stats">
            {indicadores(reporte).map((indicador) => (
              <div key={indicador.etiqueta}>
                <span>{indicador.etiqueta}</span>
                <strong>{indicador.valor}</strong>
              </div>
            ))}
            <div>
              <span>Periodo</span>
              <strong>{periodo(reporte)}</strong>
            </div>
          </div>
          {vacio(reporte) ? (
            <Aviso
              icono="search"
              titulo="Sin registros para los filtros seleccionados"
              detalle="Ajuste el intervalo o restablezca los filtros para ver resultados."
            />
          ) : (
            children(reporte)
          )}
          {total && (
            <div className="grand-total">
              <span>{total(reporte).etiqueta}</span>
              <strong>{total(reporte).valor}</strong>
            </div>
          )}
        </>
      )}
    </section>
  )
}

interface AvisoProps {
  icono: 'search' | 'close' | 'clock'
  titulo: string
  detalle: string
  accion?: ReactNode
}

function Aviso({ icono, titulo, detalle, accion }: AvisoProps) {
  return (
    <div className="filter-empty">
      <span>
        <Icon name={icono} />
      </span>
      <strong>{titulo}</strong>
      <p>{detalle}</p>
      {accion}
    </div>
  )
}
