import { solicitar } from '../../api/clienteHttp'
import type { RepublicacionResponse } from '../../types/identityTypes'

/** POST /admin/republicar-eventos → 200. Idempotente; solo ADMIN_SISTEMA. */
export function republicarEventos(signal?: AbortSignal) {
  return solicitar<RepublicacionResponse>({ method: 'POST', url: '/admin/republicar-eventos', signal })
}
