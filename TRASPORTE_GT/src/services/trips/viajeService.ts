import { clienteViajes, solicitar } from '../../api/clienteHttp'
import { MAX_IDS_RESUMEN, type ViajeResumen } from '../../types/tripTypes'

export async function obtenerResumenViajes(ids: string[], signal?: AbortSignal): Promise<ViajeResumen[]> {
  const unicos = [...new Set(ids)]
  if (!unicos.length) return []
  // Más de 100 viajes (no ocurre con las páginas del historial): se piden por bloques.
  const bloques: string[][] = []
  for (let inicio = 0; inicio < unicos.length; inicio += MAX_IDS_RESUMEN) {
    bloques.push(unicos.slice(inicio, inicio + MAX_IDS_RESUMEN))
  }
  const respuestas = await Promise.all(
    bloques.map((bloque) =>
      solicitar<ViajeResumen[]>(
        { method: 'GET', url: '/viajes/resumen', params: { ids: bloque.join(',') }, signal },
        clienteViajes,
      ),
    ),
  )
  return respuestas.flat()
}
