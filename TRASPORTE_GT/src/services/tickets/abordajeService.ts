import { clienteBoletos, solicitar } from '../../api/clienteHttp'
import type { Abordaje, PasajerosViaje, ResultadoAbordaje } from '../../types/ticketTypes'

/** GET /boletos/viajes/{id}/pasajeros → 200 | 403 viaje de otra sucursal | 404. Solo CAJERO y ADMIN_SUCURSAL. */
export function listarPasajeros(idViaje: string, signal?: AbortSignal) {
  return solicitar<PasajerosViaje>({ method: 'GET', url: `/boletos/viajes/${idViaje}/pasajeros`, signal }, clienteBoletos)
}

/**
 * POST /boletos/viajes/{id}/abordajes `{ codigo }` → 201 | 200 ya había abordado | 404 código inexistente
 * | 409 BOLETO_NO_VALIDO (anulado o de otro viaje) o VIAJE_NO_DISPONIBLE (ya salió).
 */
export async function registrarAbordaje(idViaje: string, codigo: string, signal?: AbortSignal): Promise<ResultadoAbordaje> {
  const respuesta = await clienteBoletos.post<Abordaje>(`/boletos/viajes/${idViaje}/abordajes`, { codigo }, { signal })
  return { abordaje: respuesta.data, nuevo: respuesta.status === 201 }
}
