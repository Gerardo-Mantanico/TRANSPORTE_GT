import { clienteClientes, solicitar } from '../../api/clienteHttp'
import type {
  ActualizarPerfilClienteRequest,
  Cliente,
  ClienteBusqueda,
  RepublicacionClientesResponse,
} from '../../types/customerWalletTypes'

/** GET /clientes/yo → 200 | 404 si el perfil aún no llega con UsuarioCreado */
export function obtenerMiPerfilCliente(signal?: AbortSignal) {
  return solicitar<Cliente>({ method: 'GET', url: '/clientes/yo', signal }, clienteClientes)
}

/** PUT /clientes/yo → 200 | 400 NIT/DPI/teléfono inválidos o CF | 409 NIT o DPI duplicados */
export function actualizarMiPerfilCliente(datos: ActualizarPerfilClienteRequest, signal?: AbortSignal) {
  return solicitar<Cliente>({ method: 'PUT', url: '/clientes/yo', data: datos, signal }, clienteClientes)
}

/** GET /clientes/buscar?nit= → 200 | 404. Solo CAJERO y ADMIN_SUCURSAL. */
export function buscarClientePorNit(nit: string, signal?: AbortSignal) {
  return solicitar<ClienteBusqueda>({ method: 'GET', url: '/clientes/buscar', params: { nit }, signal }, clienteClientes)
}

/** POST /admin/republicar-eventos → 200. Solo ADMIN_SISTEMA. */
export function republicarEventosClientes(signal?: AbortSignal) {
  return solicitar<RepublicacionClientesResponse>(
    { method: 'POST', url: '/admin/republicar-eventos', signal },
    clienteClientes,
  )
}
