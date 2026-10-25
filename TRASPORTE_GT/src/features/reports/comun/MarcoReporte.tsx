import type { ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'
import { Icon } from '../../../components/ui/Icon'
import type { ResultadoConsulta } from '../../../hooks/useConsulta'
import type { ReporteTabla } from '../../../types/reportTypes'
import { exportToPdf, formatDateEs, formatFechaHora } from '../../../utils/format'
import { ETIQUETA_FILTRO } from './etiquetas'

export interface Indicador {
  etiqueta: string
  valor: string
}

interface MarcoReporteProps<F> {
  titulo: string
  subtitulo: string
  consulta: ResultadoConsulta<ReporteTabla<F>>
  filtros: ReactNode
  /** Tres indicadores para la franja de resumen. */
  indicadores: (reporte: ReporteTabla<F>) => Indicador[]
  /** Tabla (o mapa + tabla) del reporte. */
  children: (reporte: ReporteTabla<F>) => ReactNode
  total?: (reporte: ReporteTabla<F>) => Indicador
  /** Mensaje cuando la consulta está deshabilitada (falta elegir sucursal). */
  pendiente?: string | null
  vacio: (reporte: ReporteTabla<F>) => boolean
}

function periodo(reporte: ReporteTabla<unknown>): string {
  const { desde, hasta } = reporte.filtros
  if (!desde && !hasta) return 'Todo el historial'
  return `${desde ? formatDateEs(desde) : 'inicio'} — ${hasta ? formatDateEs(hasta) : 'hoy'}`
}

/**
 * Estructura común de los 12 reportes: encabezado, filtros, resumen, contenido y total.
 * El PDF se genera por ahora con la impresión del navegador; luego lo hará el backend (JasperReports).
 */
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
}: MarcoReporteProps<F>) {
  const reporte = consulta.datos

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
        <Button icon="download" onClick={exportToPdf} disabled={!reporte}>
          Exportar PDF
        </Button>
      </div>
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
