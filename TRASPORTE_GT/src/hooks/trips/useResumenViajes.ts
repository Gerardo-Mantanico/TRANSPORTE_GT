import { useMemo } from 'react'
import { useConsulta } from '../useConsulta'
import { obtenerResumenViajes } from '../../services/trips'
import type { ViajeResumen } from '../../types/tripTypes'

/** Resumen de los viajes indicados en una sola llamada, indexado por id. Los eliminados no vienen. */
export function useResumenViajes(ids: string[]) {
  const unicos = useMemo(() => [...new Set(ids)].sort(), [ids])
  const clave = unicos.join(',')
  const consulta = useConsulta((signal) => obtenerResumenViajes(unicos, signal), clave, unicos.length > 0)
  const porId = useMemo(
    () => new Map<string, ViajeResumen>((consulta.datos ?? []).map((viaje) => [viaje.id, viaje])),
    [consulta.datos],
  )
  return { ...consulta, porId }
}
