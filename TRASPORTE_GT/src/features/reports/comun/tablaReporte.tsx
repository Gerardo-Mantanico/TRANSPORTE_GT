import type { ReactNode } from 'react'
import type { GrupoReporte, ValorTotal } from '../../../types/reportTypes'
import { formatMonto } from '../../../utils/format'

export interface ColumnaReporte<F> {
  titulo: string
  celda: (fila: F) => ReactNode
  /** Clave de `subtotales` que se muestra en esta columna en las filas de subtotal. */
  subtotal?: string
  /** El subtotal es dinero (texto con 2 decimales). */
  dinero?: boolean
}

function valorSubtotal(valor: ValorTotal | undefined, dinero: boolean): string {
  if (valor === undefined) return ''
  return dinero ? formatMonto(String(valor)) : String(valor)
}

/** Fila de subtotal con el estilo de los reportes (etiqueta en la primera celda). */
export function filaSubtotal<F>(
  etiquetaSubtotal: string,
  columnas: ColumnaReporte<F>[],
  subtotales: Record<string, ValorTotal> | null | undefined,
): ReactNode[] {
  return columnas.map((columna, indice) => (
    <span className="subtotal-cell" key={indice}>
      {indice === 0 ? (
        <strong>{etiquetaSubtotal}</strong>
      ) : columna.subtotal ? (
        <strong>{valorSubtotal(subtotales?.[columna.subtotal], Boolean(columna.dinero))}</strong>
      ) : (
        ''
      )}
    </span>
  ))
}

/**
 * Aplana los grupos en filas para `DataTable`: detalle, subtotal del subgrupo y subtotal del grupo.
 * Los grupos sin clave (reportes sin agrupación) no llevan subtotal.
 */
export function filasDeGrupos<F>(
  grupos: GrupoReporte<F>[],
  columnas: ColumnaReporte<F>[],
  prefijo = 'Subtotal',
): ReactNode[][] {
  const filas: ReactNode[][] = []
  grupos.forEach((grupo) => {
    if (grupo.subgrupos?.length) {
      filas.push(...filasDeGrupos(grupo.subgrupos, columnas, `${prefijo} ${grupo.titulo ?? ''} ·`))
    } else {
      ;(grupo.filas ?? []).forEach((fila) => filas.push(columnas.map((columna) => columna.celda(fila))))
    }
    if (grupo.clave != null && grupo.subtotales) {
      filas.push(filaSubtotal(`${prefijo} ${grupo.titulo ?? ''}`.trim(), columnas, grupo.subtotales))
    }
  })
  return filas
}

/** Cantidad de filas de detalle (sin subtotales). */
export function contarFilas<F>(grupos: GrupoReporte<F>[]): number {
  return grupos.reduce(
    (total, grupo) => total + (grupo.subgrupos ? contarFilas(grupo.subgrupos) : (grupo.filas?.length ?? 0)),
    0,
  )
}
