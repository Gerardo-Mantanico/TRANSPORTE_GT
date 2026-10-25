import { useState } from 'react'
import type { FiltroFechas } from '../../../types/reportTypes'

export interface FiltrosReporteEstado<T extends object> {
  /** "Todo el historial": sin intervalo de fechas. */
  todo: boolean
  desde: string
  hasta: string
  extra: T
}

/**
 * Borrador y filtros aplicados de un reporte. El reporte solo se vuelve a pedir al aplicar.
 * Sin intervalo = todos los registros (regla del enunciado).
 */
export function useFiltrosReporte<T extends object>(extraInicial: T, hoy: string) {
  const inicial: FiltrosReporteEstado<T> = { todo: true, desde: hoy, hasta: hoy, extra: extraInicial }
  const [borrador, setBorrador] = useState(inicial)
  const [aplicados, setAplicados] = useState(inicial)

  const rangoInvalido =
    !borrador.todo && Boolean(borrador.desde && borrador.hasta && borrador.desde > borrador.hasta)

  const intervalo: FiltroFechas = aplicados.todo
    ? {}
    : { desde: aplicados.desde || undefined, hasta: aplicados.hasta || undefined }

  return {
    borrador,
    aplicados,
    intervalo,
    rangoInvalido,
    cambiar: (cambio: Partial<FiltrosReporteEstado<T>>) => setBorrador((actual) => ({ ...actual, ...cambio })),
    cambiarExtra: (cambio: Partial<T>) =>
      setBorrador((actual) => ({ ...actual, extra: { ...actual.extra, ...cambio } })),
    aplicar: () => {
      if (!rangoInvalido) setAplicados(borrador)
    },
    restablecer: () => {
      setBorrador(inicial)
      setAplicados(inicial)
    },
  }
}

export type FiltrosReporteControl<T extends object> = ReturnType<typeof useFiltrosReporte<T>>
